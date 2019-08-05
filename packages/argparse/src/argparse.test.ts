import {argparse, IArgsConfig} from './argparse'

describe('argparse', () => {

  it('parses args', () => {
    const args = argparse({
      one: {
        type: 'string',
        required: true,
      },
      two: {
        type: 'number',
        default: 1,
      },
      four: {
        type: 'boolean',
      },
    })(['--one', '1', '--two', '2', '--four'])

    const one: string = args.one
    const two: number = args.two
    const four: boolean = args.four

    expect(one).toBe('1')
    expect(two).toBe(2)
    expect(four).toBe(true)
  })

  describe('boolean', () => {
    it('is not required, and is false by default', () => {
      const result = argparse({
        bool: {
          type: 'boolean',
        },
      })([])
      const value: boolean = result.bool
      expect(value).toBe(false)
    })
    it('can be made required', () => {
      expect(() => argparse({
        bool: {
          type: 'boolean',
          required: true,
        },
      })([])).toThrowError(/Missing required args: bool/)
    })
    it('optionally accepts a true/false value', () => {
      const parse = argparse({
        bool: {
          type: 'boolean',
          alias: 'b',
        },
        other: {
          type: 'string',
        },
      })
      expect(parse(['--bool']).bool).toBe(true)
      expect(parse(['--bool', 'false']).bool).toBe(false)
      expect(parse(['--bool', 'true']).bool).toBe(true)
      expect(parse(['--bool', '--other', 'value'])).toEqual({
        bool: true,
        other: 'value',
      })
    })
    it('can be grouped by shorthand (single dash) notation', () => {
      const parse = argparse({
        a1: {
          type: 'boolean',
          alias: 'a',
        },
        b: {
          type: 'boolean',
          alias: 'c',
        },
        other: {
          type: 'string',
          alias: 'o',
        },
      })
      expect(parse([])).toEqual({
        a1: false,
        b: false,
        other: '',
      })
      expect(parse(['-ab'])).toEqual({
        a1: true,
        b: true,
        other: '',
      })
      expect(parse(['-ca'])).toEqual({
        a1: true,
        b: true,
        other: '',
      })
      expect(parse(['-abo', 'test'])).toEqual({
        a1: true,
        b: true,
        other: 'test',
      })
      expect(() => parse(['-abo'])).toThrowError(/must be a string: -abo/)
    })
  })

  describe('number', () => {
    it('sets to NaN by default', () => {
      const parse = argparse({
        a: {
          type: 'number',
        },
      })
      expect(parse([])).toEqual({
        a: NaN,
      })
      expect(() => parse(['-a'])).toThrowError(/must be a number: -a/)
      expect(() => parse(['-a', 'no-number']))
      .toThrowError(/must be a number: -a/)
      expect(() => parse(['--a', 'no-number']))
      .toThrowError(/must be a number: --a/)
      expect(parse(['-a', '10'])).toEqual({
        a: 10,
      })
      expect(parse(['--a', '11'])).toEqual({
        a: 11,
      })
    })
  })

  it('throws when required args missing', () => {
    expect(() => argparse({
      one: {
        type: 'string',
        required: true,
      },
    })([])).toThrowError(/missing required/i)
  })

  it('throws when arg type is unknown', () => {
    expect(() => argparse({
      a: {
        type: 'test',
      } as any,
    })(['-a'])).toThrowError(/Unknown type: test/)
  })

})
