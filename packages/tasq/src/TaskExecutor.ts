import {EventEmitter} from 'events'
import {LinkedList} from './LinkedList'

export interface ITask<T> {
  execute(): Promise<void>
}

interface ITaskEvents {
  success: void
  failure: Error
}

export interface ITaskExecutor<T> {
  post(task: T): void

  wait(): Promise<void>

  addListener<E extends keyof ITaskEvents>(
    event: E, listener: (value: ITaskEvents[E]) => void): void
  removeListener<E extends keyof ITaskEvents>(
    event: E, listener: (value: ITaskEvents[E]) => void): void
}

let counter = 0

export class TaskExecutor<T> implements ITaskExecutor<T> {
  protected taskQueue = new LinkedList<T>()
  protected workers: Set<Promise<void>> = new Set()
  protected events = new EventEmitter()

  constructor(
    readonly n: number = 1,
    readonly processTask: (task: T) => Promise<void>,
  ) {
  }

  addListener<E extends keyof ITaskEvents>(
    event: E, listener: (value: ITaskEvents[E]) => void): void {
    this.events.addListener(event, listener)
  }
  removeListener<E extends keyof ITaskEvents>(
    event: E, listener: (value: ITaskEvents[E]) => void): void {
    this.events.removeListener(event, listener)
  }

  post(task: T) {
    this.taskQueue.push(task)
    if (this.workers.size < this.n) {
      const worker = this.startWorker()
    }
  }

  protected async startWorker() {
    counter++
    const promise = this._startWorker(counter)
    this.workers.add(promise)
    await promise
    this.workers.delete(promise)
  }

  protected async _startWorker(id: number) {
    let task = this.taskQueue.shift()
    while (task !== undefined) {
      try {
        await this.processTask(task)
        this.events.emit('success')
      } catch (err) {
        this.events.emit('failure', err)
      }
      task = this.taskQueue.shift()
    }
  }

  async wait() {
    const workers = Array.from(this.workers)
    for (const worker of workers) {
      await worker
    }
  }
}
