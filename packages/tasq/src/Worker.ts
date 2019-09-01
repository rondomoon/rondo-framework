import cp from 'child_process'
import { LinkedList } from './LinkedList'
import { IExecutor } from './Executor'
import { ITask } from './ITask'

export interface IWorker<T> {
  start(): Promise<void>
}

export class Worker<T> implements IWorker<T> {
  constructor(
    protected executor: IExecutor<T>,
    protected taskQueue: LinkedList<ITask<T>>,
    protected callback: (id: number, err?: Error) => void,
  ) {
  }

  async start() {
    let task = this.taskQueue.shift()
    while (task !== undefined) {
      try {
        await this.executor.execute(task)
        this.callback(task.id)
      } catch (err) {
        this.callback(task.id, err)
      }
      task = this.taskQueue.shift()
    }
  }
}
