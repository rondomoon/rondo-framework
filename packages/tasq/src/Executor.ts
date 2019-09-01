import { ITask } from './ITask'
import cp from 'child_process'
import { LinkedList } from './LinkedList'

export interface IExecutor<T> {
  execute(task: ITask<T>): Promise<void>
}

export type ExecutorFactory<T> = () => IExecutor<T>

export class PromiseExecutor<T> implements IExecutor<T> {
  constructor(readonly execute: (task: ITask<T>) => Promise<void>) {}
}

class SubprocessExecutor<T> implements IExecutor<T> {
  process: cp.ChildProcess

  constructor(
    protected sourceFile: string, protected taskQueue: LinkedList<ITask<T>>,
  ) {
    this.process = cp.fork(sourceFile)
  }

  async execute(task: ITask<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.process.on('status_' + task.id, message => {
        if (message.error) {
          reject(message.error)
        } else {
          resolve()
        }
      })
      this.process!.send(task)
    })
  }
}
