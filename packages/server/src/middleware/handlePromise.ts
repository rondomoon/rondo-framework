import { Handler } from './Handler'
import { PromiseHandler } from './PromiseHandler'

export function handlePromise<T>(endpoint: PromiseHandler<T>): Handler {
  return (req, res, next) => {
    const promise = endpoint(req, res, next)
    promise
    .then(result => res.json(result))
    .catch(next)
  }
}
