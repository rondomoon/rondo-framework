import { Messenger } from '../Messenger'
import { IExecutor } from '../Executor'
import { IRequest } from '../ITask'

const executor = new (class implements IExecutor<[number, number], number> {
  async execute(task: IRequest<[number, number]>) {
    await new Promise(resolve => {
      setTimeout(resolve, 1)
    })
    return task.params[0] + task.params[1]
  }
})()

export const messenger = new Messenger(executor)
