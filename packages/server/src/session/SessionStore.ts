import {Store} from 'express-session'
import {ISession} from './ISession'
import {Repository, LessThan} from 'typeorm'

type SessionData = Express.SessionData
type Callback = (err?: any, session?: SessionData) => void
type CallbackErr = (err?: any) => void

export interface ISessionStoreOptions<S extends ISession> {
  readonly ttl: number
  readonly cleanup: number
  readonly getRepository: TRepositoryFactory<S>
  buildSession(sessionData: SessionData, session: ISession): S
}

export type TRepositoryFactory<T> = () => Repository<T>

// TODO casting as any because TypeScript complains. Looks like this is a
// bug in TypeScript 3.2.2
//
// https://github.com/typeorm/typeorm/issues/1544
// https://github.com/Microsoft/TypeScript/issues/21592
export class SessionStore<S extends ISession> extends Store {

  protected readonly getRepository: TRepositoryFactory<S>

  constructor(
    protected readonly options: ISessionStoreOptions<S>,
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
    const promise1 = this.options.cleanup
      ? this.cleanup() : Promise.resolve()
    const promise2 = promise1.then(() => this.saveSession(
      this.options.buildSession(session, {
        id: sid,
        expiredAt: Date.now() + this.getTTL(session) * 1000,
        json: JSON.stringify(session),
      }),
    ))
    this.promiseToCallback(promise2, callback)
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

  protected async cleanup() {
    const now = Date.now()
    // FIXME causes deadlocks in tests
    await this.getRepository().delete({
      expiredAt: LessThan(now),
    } as any)
  }

}
