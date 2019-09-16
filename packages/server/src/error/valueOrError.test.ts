import { valueOrError } from './'

describe('valueOrError', () => {

  it('throws a 404 error when value is undefined', () => {
    expect(() => valueOrError(undefined)).toThrowError('Not Found')
  })

  it('throws a 404 error when value is null', () => {
    expect(() => valueOrError(null)).toThrowError('Not Found')
  })

  it('returns the value when it is neither null, nor undefined', () => {
    const obj = {}
    expect(valueOrError(obj)).toBe(obj)
    expect(valueOrError(0)).toBe(0)
    expect(valueOrError(1)).toBe(1)
    expect(valueOrError('')).toBe('')
  })

  it('returns a HTTP error with custom status code', () => {
    expect(() => valueOrError(undefined, 400)).toThrowError('Bad Request')
  })

  it('removes undefined and null from function', () => {
    function getValue(): number | undefined {
      return 1
    }
    const obj1 = getValue()
    const obj2: number = valueOrError(obj1)
    expect(obj2).toEqual(1)
  })

})
