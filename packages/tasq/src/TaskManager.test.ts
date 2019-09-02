import {TaskManager} from './TaskManager'
import { PromiseExecutor } from './Executor'

describe('TaskManager', () => {

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  describe('post', () => {
    it('posts new tasks and executes asynchronously', async () => {
      const results: number[] = []
      const te = new TaskManager<number, void>(
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
      const te = new TaskManager<number, void>(
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
      const te = new TaskManager<number, void>(
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

    it('can return values from promises', async () => {
      interface IParams {
        a: number,
        b: number,
        delay: number
      }
      const te = new TaskManager<IParams, number>(
        2,
        () => new PromiseExecutor(async task => {
          const {definition} = task
          await delay(definition.delay)
          return definition.a + definition.b
        }),
      )
    })

  })

  async function getError(p: Promise<unknown>): Promise<Error> {
    let error: Error | undefined
    try {
      await p
    } catch (err) {
      error = err
    }
    expect(error).toBeDefined()
    return error!
  }

  describe('error handling', () => {
    it('does not fail on error', async () => {
      const tm = new TaskManager<number, void>(2,
        () => new PromiseExecutor(async task => {
          await delay(task.definition)
          if (task.definition % 2 === 0) {
            throw new Error('Test error: ' + task.id)
          }
        }))

      const results = await Promise.all([
        tm.post(1),
        getError(tm.post(2)),
        tm.post(3),
        getError(tm.post(4)),
      ])

      expect(results[0]).toBe(undefined)
      expect(results[1].message).toMatch(/test error/i)
      expect(results[2]).toBe(undefined)
      expect(results[3].message).toMatch(/test error/i)
    })
  })

})
