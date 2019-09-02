import {EventEmitter} from 'events'
import {LinkedList} from './LinkedList'
import {Deferred} from './Deferred'
import { Worker } from './Worker'
import { ExecutorFactory } from './Executor'
import { IRequest } from './ITask'

interface ITaskEventHandler {
  success: () => void
  failure: (err: Error) => void
}

export interface ITaskManager<T> {
  post(task: T): void
  wait(): Promise<void>
}

export class TaskManager<T, R> implements ITaskManager<T> {
  protected taskQueue = new LinkedList<IRequest<T>>()
  protected workers: Set<Promise<void>> = new Set()
  protected deferredTasks = new Map<number, Deferred<R>>()

  protected taskCount = 0

  constructor(
    readonly n: number = 1,
    readonly createExecutor: ExecutorFactory<T, R>,
  ) {
  }

  async post(params: T) {
    const id = this.getNextTaskId()
    this.taskQueue.push({
      id,
      params,
    })

    const deferred = new Deferred<R>()
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
      response => {
        const deferred = this.deferredTasks.get(response.id)
        if (!deferred) {
          throw new Error('No deferred found for task id:' + response.id)
          return
        }
        if (response.type === 'error') {
          deferred.reject(response.error)
        } else {
          deferred.resolve(response.result)
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
