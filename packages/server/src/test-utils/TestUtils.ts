import express from 'express'
import supertest from 'supertest'
import {Connection, QueryRunner} from 'typeorm'
import {
  ENTITY_MANAGER, ITransactionManager, TRANSACTION_ID,
} from '../database/ITransactionManager'
import {IRoutes} from '@rondo.dev/http-types'
import {IBootstrap} from '../application/IBootstrap'
import {RequestTester} from './RequestTester'
import {Role} from '../entities/Role'
import {CORRELATION_ID} from '../middleware'
import shortid from 'shortid'
import { AddressInfo } from 'net'
import { createRemoteClient, FunctionPropertyNames, TAsyncified } from '@rondo.dev/jsonrpc'
import {Server} from 'http'
import { IAppServer } from '../application/IAppServer'

export class TestUtils<T extends IRoutes> {
  readonly username = `test${process.env.JEST_WORKER_ID}@user.com`
  readonly password = 'Password10'

  readonly app: IAppServer
  readonly context: string
  readonly transactionManager: ITransactionManager

  constructor(readonly bootstrap: IBootstrap) {
    this.app = bootstrap.application.server
    this.context = this.bootstrap.getConfig().app.context
    this.transactionManager = this.bootstrap.database.transactionManager
  }

  /**
   * Set up beforeEach and afterEach cases for jest tests. Helps create and
   * execute the tests in transaction, and rolls it back in the end.
   */
  withDatabase() {
    const {database} = this.bootstrap
    const {namespace} = database

    let connection!: Connection
    let queryRunner: QueryRunner

    let context: any

    beforeAll(async () => {
      connection = await database.connect()
    })

    beforeEach(async () => {
      context = namespace.createContext();
      (namespace as any).enter(context)
      queryRunner = connection.createQueryRunner()
      await queryRunner.connect()
      namespace.set(TRANSACTION_ID, shortid())
      await queryRunner.startTransaction()
      namespace.set(ENTITY_MANAGER, queryRunner.manager)
    })

    afterEach(async () => {
      // TODO transaction should always be active, no?
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction()
      }
      await queryRunner.release()
      namespace.set(TRANSACTION_ID, undefined)
      namespace.set(ENTITY_MANAGER, undefined);
      (namespace as any).exit(context)
    })

    afterAll(async () => {
      await database.close()
    })
  }

  async createRole(name: string) {
    return this.transactionManager
    .getRepository(Role)
    .save({name})
  }

  async getError(promise: Promise<any>): Promise<Error> {
    let error!: Error
    try {
      await promise
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    return error
  }

  async getCsrf() {
    const {context} = this
    const response = await supertest(this.app)
    .get(`${context}/app`)
    .expect(200)
    const cookie = this.getCookies(response.header['set-cookie'])
    const token = this.getCsrfToken(response.text)
    expect(cookie).toBeTruthy()
    expect(token).toBeTruthy()
    return {cookie, token}
  }

  protected getCsrfToken(responseText: string) {
    const match = responseText.match(/"csrfToken":"(.*?)"/)
    expect(match).toBeTruthy()
    expect(match!.length).toBe(2)
    return match![1]
  }

  getLoginBody(csrfToken: string, username?: string) {
    const {password} = this
    return {
      username: username || this.username,
      password,
      _csrf: csrfToken,
    }
  }

  async registerAccount(username?: string) {
    const {context} = this
    const {cookie, token} = await this.getCsrf()

    const response = await supertest(this.app)
    .post(`${context}/api/auth/register`)
    .set('cookie', cookie)
    .send({
      firstName: 'test',
      lastName: 'test',
      ...this.getLoginBody(token, username),
    })
    .expect(200)

    const cookies = this.getCookies(response.header['set-cookie'])

    return {
      headers: {
        'cookie': [cookies, cookie].join('; '),
        'x-csrf-token': token,
      },
      userId: response.body.id,
    }
  }

  async login(username = this.username, password = this.password) {
    const {context} = this
    const {cookie, token} = await this.getCsrf()

    const response = await supertest(this.app)
    .post(`${context}/api/auth/login`)
    .set('cookie', cookie)
    .send({username, password, _csrf: token})
    .expect(200)

    const cookies = this.getCookies(response.header['set-cookie'])

    return {
      headers: {
        'cookie': [cookies, cookie].join('; '),
        'x-csrf-token': token,
      },
    }
  }

  request = (baseUrl = '') => {
    return new RequestTester<T>(
      this.app,
      `${this.bootstrap.getConfig().app.baseUrl.path!}${baseUrl}`)
  }

  /**
   * Starts the server, invokes a rpc method, and closes the server after
   * invocation.
   */
  rpc = <S>(
    serviceUrl: string,
    methods: Array<FunctionPropertyNames<S>>,
    headers: Record<string, string>,
  ) => {
    const {app} = this
    const url = `${this.bootstrap.getConfig().app.baseUrl.path!}${serviceUrl}`

    const service = methods.reduce((obj, method) => {
      obj[method] = async function makeRequest(...args: any[]) {
        let server!: Server
        await new Promise(resolve => {
          server = app.listen(0, '127.0.0.1', resolve)
        })
        const addr = server.address() as AddressInfo
        const fullUrl = `http://${addr.address}:${addr.port}${url}`
        const remoteService = createRemoteClient<S>(fullUrl, methods, headers)
        try {
          return await remoteService[method](...args as any)
        } finally {
          await new Promise(resolve => server.close(resolve))
        }
      }
      return obj
    }, {} as any)

    return service as TAsyncified<S>
  }

  private getCookies(setCookiesString: string[]): string {
    return setCookiesString.map(c => c.split('; ')[0]).join('; ')
  }

}
