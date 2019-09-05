import { IRequest } from './ITask'
import cp from 'child_process'
import { LinkedList } from './LinkedList'

export interface IExecutor<T, R> {
  execute(task: IRequest<T>): Promise<R>
}

export type ExecutorFactory<T, R> = () => IExecutor<T, R>

export class PromiseExecutor<T, R> implements IExecutor<T, R> {
  constructor(readonly execute: (task: IRequest<T>) => Promise<R>) {}
}

export class SubprocessExecutor<T, R> implements IExecutor<T, R> {
  process: cp.ChildProcess

  constructor(protected sourceFile: string) {
    this.process = cp.fork(sourceFile)
  }

  async execute(task: IRequest<T>): Promise<R> {
    return new Promise((resolve, reject) => {
      this.process.once('response_' + task.id, message => {
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
