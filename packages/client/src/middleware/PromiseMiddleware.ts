import assert from 'assert'
import {AnyAction, Middleware} from 'redux'

function isPromise(value: any): value is Promise<any> {
  return value && typeof value === 'object' &&
    typeof (value as any).then === 'function'
}

/**
 * Handles promises returned from Actions.
 *
 * If `action.payload` is a `Promise`, it will be handled by this class. It
 * differs from other promise middlewares for redux because by default it does
 * not add an extension to action dispatched after a promise is fulfilled. This
 * makes it easier to infer types from the API endpoints so they can be used in
 * both Action creators and Reducers.
 *
 * Usage:
 *
 *     const middleware = applyMiddleware(new PromiseMiddleware().handle)
 */
export class PromiseMiddleware {
  constructor(
    readonly pendingExtension = '_PENDING',
    readonly fulfilledExtension = '',
    readonly rejectedExtension = '_REJECTED',
  ) {
    assert(
      this.pendingExtension !== this.fulfilledExtension &&
      this.fulfilledExtension !== this.rejectedExtension &&
      this.pendingExtension !== this.rejectedExtension,
      'Pending, fulfilled and rejected extensions must be unique')
  }
  handle: Middleware = store => next => (action: AnyAction) => {
    const {payload, type} = action
    if (!isPromise(payload)) {
      next(action)
      return
    }
    store.dispatch({type: type + this.pendingExtension})

    payload
    .then(result => {
      store.dispatch({
        payload: result,
        type,
      })
    })
    .catch(err => {
      store.dispatch({
        error: err,
        type: type + this.rejectedExtension,
      })
    })

    return action
  }
}
