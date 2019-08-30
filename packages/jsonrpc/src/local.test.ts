import {createLocalClient} from './local'
import {keys} from 'ts-transformer-keys'
import {Contextual, ReverseContextual, TAsyncified} from './types'

describe('local', () => {

  interface IService {
    add(a: number, b: number): number
    addWithContext(a: number, b: number): number
  }
  const IServiceKeys = keys<IService>()

  interface IContext {
    userId: 1000
  }

  class Service implements Contextual<IService, IContext> {
    add(cx: IContext, a: number, b: number) {
      return a + b
    }
    addWithContext = (cx: IContext, a: number, b: number) => {
      return a + b + cx.userId
    }
  }

  const service = new Service()

  const proxy = createLocalClient(service, () => ({userId: 1000}))

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
