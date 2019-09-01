import {TaskManager} from './TaskManager'
import { PromiseExecutor } from './Executor'

describe('TaskManager', () => {

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  describe('post', () => {
    it('posts new tasks and executes asynchronously', async () => {
      const results: number[] = []
      const te = new TaskManager<number>(
        1,
        () => new PromiseExecutor(async task => {
          await delay(task.definition)
          results.push(task.definition)
        }),
      )
      te.post(10)
      te.post(5)
      te.post(7)
      await te.wait()
      expect(results).toEqual([10, 5, 7])
    })
    it('executes tasks in different order', async () => {
      const results: number[] = []
      const te = new TaskManager<number>(
        2,
        () => new PromiseExecutor(async task => {
          await delay(task.definition)
          results.push(task.definition)
        }),
      )
      te.post(100) // worker1
      te.post(50) // worker2
      te.post(85) // worker2
      te.post(10) // worker1
      await te.wait()
      expect(results).toEqual([50, 100, 10, 85])
    })

    it('returns promises when job posted', async () => {
      const results: number[] = []
      const te = new TaskManager<number>(
        2,
        () => new PromiseExecutor(async task => {
          await delay(task.definition)
          results.push(task.definition)
        }),
      )
      await Promise.all([
        te.post(100), // worker1
        te.post(50), // worker2
        te.post(85), // worker2
        te.post(10), // worker1
      ])
      expect(results).toEqual([50, 100, 10, 85])
    })

  })

  describe('error handling', () => {
    it('does not fail on error', async () => {

    })

    it('triggers failure event on error', async () => {

    })
  })

})
