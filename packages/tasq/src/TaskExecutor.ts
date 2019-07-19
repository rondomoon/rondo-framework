export interface ITaskExecutor<T> {
  post(task: T)
  start()
  stop()
}

export class Queue<T> {
  pop()
}

export class TaskExecutor<T> implements ITaskExecutor<T> {
  protected queue: T[] = []

  post(task: T) {
    this.queue.push(task)
  }

  start() {

  }

  stop() {

  }
}
