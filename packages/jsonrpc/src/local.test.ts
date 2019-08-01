import {createLocalClient} from './local'
import {keys} from 'ts-transformer-keys'

describe('local', () => {

  interface IService {
    add(a: number, b: number): number
    addWithContext(a: number, b: number): (context: IContext) => number
  }
  const IServiceKeys = keys<IService>()

  interface IContext {
    userId: 1000
  }

  class Service implements IService {
    add(a: number, b: number) {
      return a + b
    }
    addWithContext = (a: number, b: number) => (context: IContext) => {
      return a + b + context.userId
    }
  }

  const service = new Service()
  const proxy = createLocalClient<IService>(service, {
    userId: 1000,
  })

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
