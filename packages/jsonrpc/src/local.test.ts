import { createLocalClient } from './local'
import { WithContext } from './types'

describe('local', () => {

  interface Service {
    add(a: number, b: number): number
    addWithContext(a: number, b: number): number
  }

  interface Context {
    userId: 1000
  }

  class MyService implements WithContext<Service, Context> {
    add(cx: Context, a: number, b: number) {
      return a + b
    }
    addWithContext = (cx: Context, a: number, b: number) => {
      return a + b + cx.userId
    }
  }

  const service = new MyService()

  const proxy = createLocalClient(service, {userId: 1000})

  describe('add', () => {
    it('should add two numbers', async () => {
      const result = await proxy.add(8, 9)
      expect(result).toBe(8 + 9)
    })
  })

  describe('addWithContext', () => {
    it('should add two numbers with context', async () => {
      const result = await proxy.addWithContext(8, 9)
      expect(result).toBe(1000 + 8 + 9)
    })
  })

})
