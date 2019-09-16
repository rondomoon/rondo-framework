/* eslint @typescript-eslint/no-explicit-any: 0 */
import { Routes } from '@rondo.dev/http-types'
import { createRemoteClient, FunctionPropertyNames, RPCClient } from '@rondo.dev/jsonrpc'
import { Server } from 'http'
import { AddressInfo } from 'net'
import shortid from 'shortid'
import supertest from 'supertest'
import { Connection, QueryRunner } from 'typeorm'
import { AppServer } from '../application/AppServer'
import { Bootstrap } from '../application/Bootstrap'
import { ENTITY_MANAGER, TransactionManager, TRANSACTION_ID } from '../database/TransactionManager'
import { Role } from '../entities/Role'
import { RequestTester } from './RequestTester'

export class TestUtils<T extends Routes> {
  readonly username = this.createTestUsername()
  readonly password = 'Password10'

  readonly app: AppServer
  readonly context: string
  readonly transactionManager: TransactionManager

  constructor(readonly bootstrap: Bootstrap) {
    this.app = bootstrap.application.server
    this.context = this.bootstrap.getConfig().app.context
    this.transactionManager = this.bootstrap.database.transactionManager
  }

  createTestUsername(id = 1) {
    return `test${process.env.JEST_WORKER_ID}_${id}@user.com`
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

  async getError(promise: Promise<unknown>): Promise<Error> {
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

    return service as RPCClient<S>
  }

  private getCookies(setCookiesString: string[]): string {
    return setCookiesString.map(c => c.split('; ')[0]).join('; ')
  }

}
