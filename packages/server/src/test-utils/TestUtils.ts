import express from 'express'
import supertest from 'supertest'
import {Connection, QueryRunner} from 'typeorm'
import {
  ENTITY_MANAGER, ITransactionManager,
} from '../database/ITransactionManager'
import {IRoutes} from '@rondo/common'
import {IBootstrap} from '../application/IBootstrap'
import {RequestTester} from './RequestTester'
import {Role} from '../entities/Role'

export class TestUtils<T extends IRoutes> {
  readonly username = 'test@user.com'
  readonly password = 'Password10'

  readonly app: express.Application
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

    beforeEach(async () => {
      connection = await database.connect()
      queryRunner = connection.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction()
      namespace.set(ENTITY_MANAGER, queryRunner.manager)
    })

    afterEach(async () => {
      // TODO transaction should always be active, no?
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction()
      }
      await queryRunner.release()
      namespace.set(ENTITY_MANAGER, undefined)
      await connection.close()
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
      cookie: [cookies, cookie].join('; '),
      userId: response.body.id,
      token,
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
      cookie: [cookies, cookie].join('; '),
      token,
    }
  }

  request = (baseUrl = '') => {
    return new RequestTester<T>(
      this.app,
      `${this.bootstrap.getConfig().app.baseUrl.path!}${baseUrl}`)
  }

  private getCookies(setCookiesString: string[]): string {
    return setCookiesString.map(c => c.split('; ')[0]).join('; ')
  }

}
