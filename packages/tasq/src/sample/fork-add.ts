import { Messenger } from '../Messenger'
import { Executor } from '../Executor'
import { Request } from '../Task'

const executor = new (class implements Executor<[number, number], number> {
  async execute(task: Request<[number, number]>) {
    await new Promise(resolve => {
      setTimeout(resolve, 1)
    })
    return task.params[0] + task.params[1]
  }
})()

export const messenger = new Messenger(executor)
