import {THandler} from './THandler'
import {TPromiseHandler} from './TPromiseHandler'

export function handlePromise<T>(endpoint: TPromiseHandler<T>): THandler {
  return (req, res, next) => {
    const promise = endpoint(req, res, next)
    promise
    .then(result => res.json(result))
    .catch(next)
  }
}
