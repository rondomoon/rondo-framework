import { Logger } from '@rondo.dev/logger'
import { debounce } from '@rondo.dev/tasq'
import { Store } from 'express-session'
import { LessThan, Repository } from 'typeorm'
import { DefaultSession } from './DefaultSession'

type SessionData = Express.SessionData
type Callback = (err?: any, session?: SessionData) => void
type CallbackErr = (err?: any) => void

export interface SessionStoreOptions<S extends DefaultSession> {
  readonly ttl: number
  readonly cleanupDelay: number
  readonly getRepository: RepositoryFactory<S>
  readonly logger: Logger
  buildSession(sessionData: SessionData, session: DefaultSession): S
}

export type RepositoryFactory<T> = () => Repository<T>

// TODO casting as any because TypeScript complains. Looks like this is a
// bug in TypeScript 3.2.2
//
// https://github.com/typeorm/typeorm/issues/1544
// https://github.com/Microsoft/TypeScript/issues/21592
export class SessionStore<S extends DefaultSession> extends Store {

  protected readonly getRepository: RepositoryFactory<S>

  readonly cleanup = debounce(async () => {
    try {
      const now = Date.now()
      // this method is debounced because is caused deadlock errors in tests.
      // Be wary of future problems. Debounce should fix it but this still
      // needs to be thorughly tested. The problem is a the delete statement
      // which locks the whole table.
      await this.getRepository().delete({
        expiredAt: LessThan(now),
      } as any)
    } catch (err) {
      this.options.logger.error('Error cleaning sessions: %s', err.stack)
    }
  }, 1000)

  constructor(
    protected readonly options: SessionStoreOptions<S>,
  ) {
    super()
    this.getRepository = options.getRepository
  }

  protected async promiseToCallback<T>(
    promise: Promise<T | undefined>,
    callback?: (err: any, result?: T | undefined) => void,
  ) {
    let result: T | undefined
    try {
      result = await promise
    } catch (err) {
      if (callback) {
        callback(err)
      }
      return
    }

    if (callback) {
      callback(null, result)
    }
  }

  get = (sid: string, callback: Callback) => {
    const promise = this.getRepository().findOne(sid)
    .then(session => {
      if (session) {
        return JSON.parse(session.json) as SessionData
      }
    })
    this.promiseToCallback(promise, callback)
  }

  set = (sid: string, session: SessionData, callback?: CallbackErr) => {
    this.cleanup.cancel()

    const promise = Promise.resolve()
    .then(() => this.saveSession(
      this.options.buildSession(session, {
        id: sid,
        expiredAt: Date.now() + this.getTTL(session) * 1000,
        json: JSON.stringify(session),
      }),
    ))
    this.promiseToCallback(promise, callback)

    this.cleanup()
  }

  destroy =  (sid: string, callback?: CallbackErr) => {
    const promise = this.getRepository().delete(sid)
    this.promiseToCallback(promise, callback)
  }

  touch = (
    sid: string,
    session: SessionData,
    callback?: CallbackErr,
  ) => {
    const promise = this.getRepository().update(sid, {
      userId: session.userId,
      expiredAt: Date.now() + this.getTTL(session) * 1000,
    } as any)
    this.promiseToCallback(promise, callback)
  }

  protected async saveSession(session: S) {
    return this.getRepository().save(session as any)
  }

  protected getTTL(session: SessionData): number {
    const maxAge = session.cookie.maxAge
    return typeof maxAge === 'number' ? maxAge : this.options.ttl
  }

}
