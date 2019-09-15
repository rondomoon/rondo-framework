import { DeferredPromise } from './Deferred'
import { ExecutorFactory } from './Executor'
import { Request } from './Task'
import { LinkedList } from './LinkedList'
import { QueuedWorker } from './Worker'

interface TaskEventHandler {
  success: () => void
  failure: (err: Error) => void
}

export interface TaskManager<T> {
  post(task: T): void
  wait(): Promise<void>
}

export class QueuedTaskManager<T, R> implements TaskManager<T> {
  protected taskQueue = new LinkedList<Request<T>>()
  protected workers: Set<Promise<void>> = new Set()
  protected deferredTasks = new Map<number, DeferredPromise<R>>()

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

    const deferred = new DeferredPromise<R>()
    this.deferredTasks.set(id, deferred)

    if (this.workers.size < this.n) {
      // deliberately do not use promise here
      this.startWorker()
    }

    return deferred.promise
  }

  protected getNextTaskId() {
    this.taskCount += 1
    return this.taskCount
  }

  protected async startWorker() {
    const promise = new QueuedWorker(
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
