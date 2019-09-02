import cp from 'child_process'
import { LinkedList } from './LinkedList'
import { IExecutor } from './Executor'
import { IRequest, TResponse } from './ITask'

export interface IWorker<T> {
  start(): Promise<void>
}

export type ICallback<R> = (result: TResponse<R>) => void

export class Worker<T, R> implements IWorker<T> {
  constructor(
    protected executor: IExecutor<T, R>,
    protected taskQueue: LinkedList<IRequest<T>>,
    protected callback: ICallback<R>,
  ) {
  }

  async start() {
    let task = this.taskQueue.shift()
    while (task !== undefined) {
      try {
        const result = await this.executor.execute(task)
        this.callback({
          id: task.id,
          result,
          type: 'success',
        })
      } catch (err) {
        this.callback({
          id: task.id,
          error: err,
          type: 'error',
        })
      }
      task = this.taskQueue.shift()
    }
  }
}
