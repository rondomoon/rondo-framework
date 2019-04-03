import {AnyAction, Middleware} from 'redux'
import {diff} from 'deep-object-diff'

export class ReduxLogger {
  handle: Middleware = store => next => (action: AnyAction) => {
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
    console.log(
      '%s\n  action:    %O\n  stateDiff: %O\n  prevState: %O\n  nextState: %O',
      type,
      action,
      stateDiff,
      prevState,
      nextState,
    )
    return result
  }
}
