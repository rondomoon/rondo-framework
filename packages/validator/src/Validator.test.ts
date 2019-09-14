import {Validator} from './Validator'

describe('Validator', () => {

  const entity = {
    a: 0,
    b: 1,
    c: 2,
    d: undefined,
    e: false,
    f: null,
  }

  let v!: Validator<typeof entity>
  beforeEach(() => {
    v = new Validator(entity)
  })

  describe('constructor', () => {
    it('throws when an entity is not provided', () => {
      expect(() => new Validator(undefined))
      .toThrowError(/record could not be found/)
    })
  })

  describe('ensure', () => {
    it('adds an error when a value is falsy', () => {
      v.ensure('a')
      expect(v.errors.length).toBe(1)
      v.ensure('e')
      expect(v.errors.length).toBe(2)
    })
    it('adds an error when a value does not exist', () => {
      v.ensure('b')
      expect(v.errors.length).toBe(0)
      v.ensure('b')
      expect(v.errors.length).toBe(0)
      v.ensure('c')
      expect(v.errors.length).toBe(0)
      v.ensure('d')
      expect(v.errors.length).toBe(1)
    })

    it('adds an error when a value does not match', () => {
      v.ensure('a', entity.a)
      v.ensure('b', entity.b)
      v.ensure('c', entity.c)
      v.ensure('d', entity.d)
      v.ensure('e', entity.e)
      v.ensure('f', entity.f)
      expect(v.errors.length).toBe(0)

      v.ensure('f', undefined)
      expect(v.errors.length).toBe(1)
    })
  })

  describe('getError', () => {
    it('returns undefined when no error', () => {
      v.ensure('a', entity.a)
      expect(v.getError()).toBe(undefined)
    })
    it('returns an error when a validation errors was encountered', () => {
      v.ensure('a', 999)
      const err = v.getError()!
      expect(err).toBeTruthy()
      expect(err.name).toEqual('ValidationError')
      expect(err.message).toMatch(/Validation failed on properties/)
    })
  })

  describe('throw', () => {
    it('does nothing when no validation errors', () => {
      v.ensure('a', entity.a)
      v.throw()
    })

    it('throws when there are validation errors', () => {
      v.ensure('a', 999)
      expect(() => v.throw()).toThrowError()
    })
  })

})
