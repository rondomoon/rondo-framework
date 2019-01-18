import {IHandler} from './IHandler'
import {IPromiseHandler} from './IPromiseHandler'

export function handlePromise<T>(endpoint: IPromiseHandler<T>): IHandler {
  return (req, res, next) => {
    const promise = endpoint(req, res, next)
    promise
    .then(result => res.json(result))
    .catch(next)
  }
}
