import {argparse, arg, IArgsConfig} from './argparse'

describe('argparse', () => {

  it('parses args', () => {
    const args = argparse({
      one: arg('string', {required: true}),
      two: arg('number', {default: 100}),
      four: {
        type: 'boolean',
      },
    }).parse(['--one', '1', '--two', '2', '--four'])

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
      }).parse([])
      const value: boolean = result.bool
      expect(value).toBe(false)
    })
    it('can be made required', () => {
      expect(() => argparse({
        bool: {
          type: 'boolean',
          required: true,
        },
      }).parse([])).toThrowError(/Missing required args: bool/)
    })
    it('optionally accepts a true/false value', () => {
      const {parse} = argparse({
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
      const {parse} = argparse({
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
      const {parse} = argparse({
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

  describe('choices', () => {
    it('can enforce typed choices', () => {
      const {parse} = argparse({
        choice: arg('string', {
          choices: ['a', 'b'],
        }),
        num: arg('number', {
          choices: [1, 2],
        }),
      })
      expect(() => parse(['--choice', 'c'])).toThrowError(/one of: a, b$/)
      expect(() => parse(['--num', '3'])).toThrowError(/must be one of: 1, 2$/)
      expect(parse(['--choice', 'a', '--num', '1'])).toEqual({
        choice: 'a',
        num: 1,
      })
      expect(parse(['--choice', 'b', '--num', '2'])).toEqual({
        choice: 'b',
        num: 2,
      })
    })
  })

  describe('positional', () => {
    it('can be defined', () => {
      const {parse} = argparse({
        a: {
          type: 'number',
          positional: true,
        },
      })
      expect(parse([]).a).toBe(NaN)
      expect(parse(['12']).a).toBe(12)
    })
    it('works with booleans', () => {
      const {parse} = argparse({
        a: {
          type: 'boolean',
          positional: true,
        },
      })
      expect(parse([]).a).toBe(false)
      expect(parse(['true']).a).toBe(true)
      expect(parse(['false']).a).toBe(false)
      expect(() => parse(['invalid'])).toThrowError(/true or false/)
    })
    it('works with strings', () => {
      const {parse} = argparse({
        a: {
          type: 'string',
          positional: true,
        },
      })
      expect(parse([]).a).toBe('')
      expect(parse(['a']).a).toBe('a')
    })
    it('works with multiple positionals', () => {
      const {parse} = argparse({
        a: {
          type: 'string',
          positional: true,
        },
        b: {
          type: 'string',
          positional: true,
        },
      })
      expect(parse(['aaa', 'bbb'])).toEqual({
        a: 'aaa',
        b: 'bbb',
      })
    })
    it('works amongs regular arguments', () => {
      const {parse} = argparse({
        arg1: {
          type: 'string',
        },
        arg2: {
          type: 'number',
          positional: true,
        },
        arg3: {
          type: 'string',
        },
      })
      expect(parse(['--arg1', 'one', '2', '--arg3', 'three'])).toEqual({
        arg1: 'one',
        arg2: 2,
        arg3: 'three',
      })
    })
  })

  describe('help', () => {
    it('returns help string', () => {
      const {help} = argparse({
        one: arg('string'),
        two: arg('number'),
        three: arg('boolean'),
      })
      expect(help()).toEqual([
        '    --one string               ',
        '    --two number               ',
        '    --three boolean            ',
      ].join('\n'))
    })
    it('returns help string with alias, description, and samples', () => {
      const {help} = argparse({
        one: arg('string', {
          description: 'first argument',
          required: true,
          choices: ['choice-1', 'choice-2'],
          default: 'choice-1',
          alias: 'o',
        }),
        two: arg('number'),
      })
      expect(help()).toEqual([
        '-o, --one string                first argument ' +
          '(required, default: choice-1, choices: choice-1,choice-2)',
        '    --two number               ',
      ].join('\n'))
    })

  })

  it('throws when required args missing', () => {
    expect(() => argparse({
      one: {
        type: 'string',
        required: true,
      },
    }).parse([])).toThrowError(/missing required/i)
  })

  it('throws when arg type is unknown', () => {
    expect(() => argparse({
      a: {
        type: 'test',
      } as any,
    }).parse(['-a'])).toThrowError(/Unknown type: test/)
  })

})
