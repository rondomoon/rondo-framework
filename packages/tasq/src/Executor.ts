import cp from 'child_process'
import { Request } from './Task'

export interface Executor<T, R> {
  execute(task: Request<T>): Promise<R>
}

export type ExecutorFactory<T, R> = () => Executor<T, R>

export class PromiseExecutor<T, R> implements Executor<T, R> {
  constructor(readonly execute: (task: Request<T>) => Promise<R>) {}
}

export class SubprocessExecutor<T, R> implements Executor<T, R> {
  process: cp.ChildProcess

  constructor(protected sourceFile: string) {
    this.process = cp.fork(sourceFile)
  }

  async execute(task: Request<T>): Promise<R> {
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
