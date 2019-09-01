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
}

export class TaskManager<T, R> implements ITaskManager<T> {
  protected taskQueue = new LinkedList<ITask<T>>()
  protected workers: Set<Promise<void>> = new Set()
  protected deferredTasks = new Map<number, Deferred<R>>()

  protected taskCount = 0

  constructor(
    readonly n: number = 1,
    readonly createExecutor: ExecutorFactory<T, R>,
  ) {
  }

  async post(definition: T) {
    const id = this.getNextTaskId()
    this.taskQueue.push({
      id,
      definition,
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
      (err, result) => {
        const deferred = this.deferredTasks.get(result.id)
        if (!deferred) {
          throw new Error('No deferred found for task id:' + result.id)
          return
        }
        if (err) {
          deferred.reject(err)
        } else {
          deferred.resolve(result.result)
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
