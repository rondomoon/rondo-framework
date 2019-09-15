import {guard, isNumber, isString, isDefined, isUndefined, isNull} from './guard'

function getNumber(n: number | null): number | null {
  return n
}

function getString(str: string | undefined | null): string | undefined | null {
  return str
}

describe('guard', () => {

  describe('converts T | undefined | null to T', () => {
    describe('isDefined', () => {
      it('converts T | undefined | null to T', () => {
        const s1: string | undefined | null = getString('test')
        const s2: string = guard<string>(isDefined, s1)
        expect(s2).toBe('test')
      })
    })

    describe('isString', () => {
      it('converts string | undefined | null to string', () => {
        const s1: string | undefined | null = getString('test')
        const s2: string = guard(isString, s1)
        expect(s2).toBe('test')
      })
    })

    describe('isNumber', () => {
      it('converts number | undefined | null to number', () => {
        const n1: number | undefined | null = getNumber(1)
        const n2: number = guard(isNumber, n1)
        expect(n2).toBe(1)
      })
    })

    describe('isUndefined', () => {
      const s1: string | undefined | null = getString(undefined)
      const s2: undefined = guard(isUndefined, s1)
      expect(s2).toBe(undefined)
    })

    describe('isNull', () => {
      const s1: string | undefined | null = getString(null)
      const s2: null = guard(isNull, s1)
      expect(s2).toBe(null)
    })

  })

  describe('errors', () => {
    it('guards against unexpected types', () => {
      const s1: string | undefined | null = getString(null)
      expect(() => guard(isString, s1))
      .toThrowError('Value null does not satisfy constraint: isString')
    })
  })

})
