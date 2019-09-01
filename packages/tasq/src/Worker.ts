import cp from 'child_process'
import { LinkedList } from './LinkedList'
import { IExecutor } from './Executor'
import { IResult, ITask } from './ITask'

export interface IWorker<T> {
  start(): Promise<void>
}

export type ICallback<R> = (err: Error | undefined, result: IResult<R>) => void

export class Worker<T, R> implements IWorker<T> {
  constructor(
    protected executor: IExecutor<T, R>,
    protected taskQueue: LinkedList<ITask<T>>,
    protected callback: ICallback<R>,
  ) {
  }

  async start() {
    let task = this.taskQueue.shift()
    while (task !== undefined) {
      try {
        const result = await this.executor.execute(task)
        this.callback(undefined, {
          id: task.id,
          result,
        })
      } catch (err) {
        this.callback(err, {
          id: task.id,
          result: {} as any,
        })
      }
      task = this.taskQueue.shift()
    }
  }
}
