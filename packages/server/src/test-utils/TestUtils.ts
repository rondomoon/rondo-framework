import express from 'express'
import supertest from 'supertest'
import {Connection, QueryRunner} from 'typeorm'
import {
  ENTITY_MANAGER, ITransactionManager,
} from '../database/ITransactionManager'
import {IRoutes} from '../../common/REST'
import {IBootstrap} from '../application/IBootstrap'
import {RequestTester} from './RequestTester'

export class TestUtils<T extends IRoutes> {
  readonly username = 'test@user.com'
  readonly password = 'Password10'

  readonly app: express.Application
  readonly context: string
  readonly transactionManager: ITransactionManager

  constructor(readonly bootstrap: IBootstrap) {
    this.app = bootstrap.application.server
    this.context = this.bootstrap.config.app.context
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
    const cookie = response.header['set-cookie'] as string
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

  getLoginBody(csrfToken: string) {
    const {username, password} = this
    return `username=${username}&password=${password}&_csrf=${csrfToken}`
  }

  async registerAccount() {
    const {context} = this
    const {cookie, token} = await this.getCsrf()

    const response = await supertest(this.app)
    .post(`${context}/app/auth/register`)
    .set('cookie', cookie)
    .send(this.getLoginBody(token))
    .expect(302)
    .expect('location', `${context}/app`)

    return {
      cookie: response.header['set-cookie'] as string,
      userId: response.body.userId,
    }
  }

  async login(_username = this.username, _password = this.password) {
    const {context} = this
    const {cookie, token} = await this.getCsrf()

    const response = await supertest(this.app)
    .post(`${context}/app/auth/login`)
    .set('cookie', cookie)
    .send(`username=${_username}&password=${_password}&_csrf=${token}`)
    .expect(302)
    .expect('location', `${context}/app`)

    return {cookie: response.header['set-cookie'] as string, token}
  }

  request = (baseUrl = '') => {
    return new RequestTester<T>(
      this.app,
      `${this.bootstrap.config.app.baseUrl.path!}${baseUrl}`)
  }

}
