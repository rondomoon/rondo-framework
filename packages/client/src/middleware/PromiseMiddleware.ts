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
 * not add an extension to action dispatched after a promise is resolved. This
 * makes it easier to infer types from the API endpoints so they can be used in
 * both Action creators and Reducers.
 *
 * Usage:
 *
 *     const middleware = applyMiddleware(new PromiseMiddleware().handle)
 */
export class PromiseMiddleware {
  protected regexp: RegExp

  constructor(
    readonly pendingExtension = '_PENDING',
    readonly resolvedExtension = '_RESOLVED',
    readonly rejectedExtension = '_REJECTED',
  ) {
    assert(
      this.pendingExtension !== this.resolvedExtension &&
      this.resolvedExtension !== this.rejectedExtension &&
      this.pendingExtension !== this.rejectedExtension,
      'Pending, resolved and rejected extensions must be unique')

    this.regexp = new RegExp(pendingExtension + '$')
  }
  handle: Middleware = store => next => (action: AnyAction) => {
    const {payload, type} = action
    // Propagate this action. Only attach listeners to the promise.
    next(action)
    if (!isPromise(payload)) {
      return
    }

    const strippedType = type.replace(this.regexp, '')

    payload
    .then(result => {
      store.dispatch({
        payload: result,
        type: strippedType + this.resolvedExtension,
      })
    })
    .catch(err => {
      store.dispatch({
        error: err,
        type: strippedType + this.rejectedExtension,
      })
    })

    return action
  }
}
