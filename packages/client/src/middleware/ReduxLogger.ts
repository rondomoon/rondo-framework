import {AnyAction, Middleware} from 'redux'
import {diff} from 'deep-object-diff'

export class ReduxLogger {
  constructor(readonly enabled: boolean) {}
  handle: Middleware = store => next => (action: AnyAction) => {
    if (!this.enabled) {
      return next(action)
    }
    const prevState = store.getState()
    const result = next(action)
    const nextState = store.getState()

    let type = action.type
    if ('method' in action && typeof action.method === 'string') {
      type += ':' + action.method
    }
    if ('status' in action && typeof action.status === 'string') {
      type += ':' + action.status
    }

    const stateDiff = diff(prevState, nextState)
    // tslint:disable-next-line
    console.group(type)
    // tslint:disable-next-line
    console.log(
      'action:    %O\nstateDiff: %O\nprevState: %O\nnextState: %O',
      action,
      stateDiff,
      prevState,
      nextState,
    )
    // tslint:disable-next-line
    console.groupEnd()
    return result
  }
}
