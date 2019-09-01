import { ITask } from './ITask'
import cp from 'child_process'
import { LinkedList } from './LinkedList'

export interface IExecutor<T, R> {
  execute(task: ITask<T>): Promise<R>
  shutdown(): void
}

export type ExecutorFactory<T, R> = () => IExecutor<T, R>

export class PromiseExecutor<T, R> implements IExecutor<T, R> {
  constructor(readonly execute: (task: ITask<T>) => Promise<R>) {}
  shutdown() {
    // do nothing
  }
}

class SubprocessExecutor<T, R> implements IExecutor<T, R> {
  process: cp.ChildProcess

  constructor(
    protected sourceFile: string, protected taskQueue: LinkedList<ITask<T>>,
  ) {
    this.process = cp.fork(sourceFile)
  }

  async execute(task: ITask<T>): Promise<R> {
    return new Promise((resolve, reject) => {
      this.process.on('status_' + task.id, message => {
        if (message.error) {
          reject(message.error)
        } else {
          resolve(message.result)
        }
      })
      this.process!.send(task)
    })
  }
  shutdown() {
    this.process.kill('SIGKILL')
  }
}
