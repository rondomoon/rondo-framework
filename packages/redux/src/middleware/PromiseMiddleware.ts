import {AnyAction, Middleware} from 'redux'

function isPromise(value: unknown): value is Promise<unknown> {
  return value && typeof value === 'object' &&
    typeof (value as Promise<unknown>).then === 'function'
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
  handle: Middleware = store => next => (action: AnyAction) => {
    const {payload} = action
    if (!isPromise(payload)) {
      return next(action)
    }
    const pendingAction = {
      ...action,
      status: 'pending',
    }
    // Propagate this action. Only attach listeners to the promise.
    next(pendingAction)

    payload
    .then(result => {
      store.dispatch({
        ...action,
        payload: result,
        status: 'resolved',
      })
    })
    .catch(err => {
      store.dispatch({
        ...action,
        payload: err,
        status: 'rejected',
      })
    })

    return pendingAction
  }
}
