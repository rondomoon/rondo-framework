import {EventEmitter} from 'events'
import {LinkedList} from './LinkedList'
import {Deferred} from './Deferred'
import { Worker } from './Worker'
import { ExecutorFactory } from './Executor'

interface ITask<T> {
  id: number
  definition: T
}

interface ITaskEventHandler {
  success: () => void
  failure: (err: Error) => void
}

export interface ITaskManager<T> {
  post(task: T): void

  wait(): Promise<void>

  addListener<E extends keyof ITaskEventHandler>(
    event: E, listener: ITaskEventHandler[E]): void
  removeListener<E extends keyof ITaskEventHandler>(
    event: E, listener: ITaskEventHandler[E]): void
}

export class TaskManager<T> implements ITaskManager<T> {
  protected taskQueue = new LinkedList<ITask<T>>()
  protected workers: Set<Promise<void>> = new Set()
  protected events = new EventEmitter()

  protected deferredTasks = new Map<number, Deferred<void>>()

  protected taskCount = 0

  constructor(
    readonly n: number = 1,
    readonly createExecutor: ExecutorFactory<T>,
  ) {
  }

  addListener<E extends keyof ITaskEventHandler>(
    event: E, listener: ITaskEventHandler[E]): void {
    this.events.addListener(event, listener)
  }
  removeListener<E extends keyof ITaskEventHandler>(
    event: E, listener: ITaskEventHandler[E]): void {
    this.events.removeListener(event, listener)
  }

  async post(definition: T) {
    const id = this.getNextTaskId()
    this.taskQueue.push({
      id,
      definition,
    })

    const deferred = new Deferred<void>()
    this.deferredTasks.set(id, deferred)

    if (this.workers.size < this.n) {
      // deliberately do not use promise here
      const worker = this.startWorker()
    }

    return deferred.promise
  }

  protected getNextTaskId() {
    this.taskCount += 1
    return this.taskCount
  }

  protected async startWorker() {
    const promise = new Worker(
      this.createExecutor(),
      this.taskQueue,
      (id, err) => {
        const deferred = this.deferredTasks.get(id)
        if (!deferred) {
          throw new Error('No deferred found for task id:' + id)
          // TODO this should not happen!
          return
        }
        if (err) {
          deferred.reject(err)
        } else {
          deferred.resolve()
        }
      },
    )
    .start()
    this.workers.add(promise)
    await promise
    this.workers.delete(promise)
  }

  async wait() {
    const workers = Array.from(this.workers)
    for (const worker of workers) {
      await worker
    }
  }
}
