import {ITask} from '../ITask'

process.on('message', async (task: ITask<[number, number]>) => {
  await new Promise(delay => {
    delay(task.definition)
    process.send!('status_' + task.id, {
      id: task.id,
      result: task.definition[0] + task.definition[1],
    })
  })
})
