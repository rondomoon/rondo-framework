import {Executor} from './Executor'
import { Request, Response, ErrorMessage } from './Task'

export class Messenger<T, R> {
  constructor(readonly executor: Executor<T, R>) {
    if (!process.send) {
      throw new Error('Messenger can only be used from a forked subprocess')
    }

    process.on('message', async (request: Request<T>) => {
      try {
        const result: R = await this.executor.execute(request)
        const response: Response<R> = {id: request.id, result, type: 'success'}
        process.send!('response_' + request.id, response)
      } catch (error) {
        const response: ErrorMessage = {id: request.id, error, type: 'error'}
        process.send!('response_' + request.id, response)
      }
    })
  }

  exit(code: number) {
    process.exit(code)
  }
}
