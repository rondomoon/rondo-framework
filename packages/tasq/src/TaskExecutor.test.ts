import {TaskExecutor} from './TaskExecutor'

describe('TaskExecutor', () => {

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  describe('post', () => {
    it('posts new tasks and executes asynchronously', async () => {
      const results: number[] = []
      const te = new TaskExecutor<number>(1, async task => {
        await delay(task)
        results.push(task)
      })
      te.post(10)
      te.post(5)
      te.post(7)
      await te.wait()
      expect(results).toEqual([10, 5, 7])
    })
    it('executes tasks in different order', async () => {
      const results: number[] = []
      const te = new TaskExecutor<number>(2, async task => {
        await delay(task)
        results.push(task)
      })
      te.post(100) // worker1
      te.post(50) // worker2
      te.post(85) // worker2
      te.post(10) // worker1
      await te.wait()
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
