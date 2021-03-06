import {
  ensure,
  getValidatorsForMethod,
  getValidatorsForInstance,
  Validate,
} from './ensure'

describe('ensure', () => {

  interface Context {
    userId: number
  }

  const validate: Validate<Context> = c => c.userId > 0

  it('decorates class methods', () => {
    class Service {
      @ensure<Context>(validate)
      fetchData() {
        return 1
      }
      fetchData2() {
        return 2
      }
    }
    const s = new Service()
    const validators1 = getValidatorsForMethod(s, 'fetchData')
    const validators2 = getValidatorsForMethod(s, 'fetchData2')
    expect(validators1).toEqual([ validate ])
    expect(validators2).toEqual([])
  })

  it('works with properties/instance method definitions', () => {
    class Service {
      @ensure<Context>(validate)
      fetchData = () => 1
    }
    const s = new Service()
    const validators = getValidatorsForMethod(s, 'fetchData')
    expect(validators).toEqual([ validate ])
  })

  it('decorates classes', () => {
    @ensure(validate)
    class Service {
      fetchData() {
        return 1
      }
      fetchData2() {
        return 2
      }
    }
    const s = new Service()
    const validators = getValidatorsForInstance(s)
    expect(validators).toEqual([ validate ])
  })

  it('works with subclasses', () => {
    @ensure(validate)
    class Service1 {
      fetchData() {
        return 1
      }
    }
    class Service2 extends Service1 {
      fetchData2() {
        return 2
      }
    }
    const s = new Service2()
    const validators = getValidatorsForInstance(s)
    expect(validators).toEqual([ validate ])

  })

})
