import {IExecutor} from './Executor'
import { IRequest, TResponse, IErrorMessage } from './ITask'

export class Messenger<T, R> {
  constructor(readonly executor: IExecutor<T, R>) {
    if (!process.send) {
      throw new Error('Messenger can only be used from a forked subprocess')
    }

    process.on('message', async (request: IRequest<T>) => {
      try {
        const result: R = await this.executor.execute(request)
        const response: TResponse<R> = {id: request.id, result, type: 'success'}
        process.send!('response_' + request.id, response)
      } catch (error) {
        const response: IErrorMessage = {id: request.id, error, type: 'error'}
        process.send!('response_' + request.id, response)
      }
    })
  }

  exit(code: number) {
    process.exit(code)
  }
}
