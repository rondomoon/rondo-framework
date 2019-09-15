import { Executor } from './Executor'
import { Request, Response } from './Task'
import { LinkedList } from './LinkedList'

export interface Worker<T> {
  start(): Promise<void>
}

export type Callback<R> = (result: Response<R>) => void

export class QueuedWorker<T, R> implements Worker<T> {
  constructor(
    protected executor: Executor<T, R>,
    protected taskQueue: LinkedList<Request<T>>,
    protected callback: Callback<R>,
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
