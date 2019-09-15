import { arg, argparse } from './argparse'

describe('argparse', () => {

  const CMD = 'command'
  const exit = jest.fn()
  const log = jest.fn()

  beforeEach(() => {
    exit.mockClear()
    log.mockClear()
  })

  it('parses args', () => {
    const args = argparse({
      one: arg('string', {required: true}),
      two: arg('number', {default: 100}),
      four: {
        type: 'boolean',
      },
    }).parse([CMD, '--one', '1', '--two', '2', '--four'])

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
      }).parse([CMD])
      const value: boolean = result.bool
      expect(value).toBe(false)
    })
    it('can be made required', () => {
      expect(() => argparse({
        bool: {
          type: 'boolean',
          required: true,
        },
      }).parse([CMD])).toThrowError(/Missing required args: bool/)
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
      expect(parse([CMD, '--bool']).bool).toBe(true)
      expect(parse([CMD, '--bool', 'false']).bool).toBe(false)
      expect(parse([CMD, '--bool', 'true']).bool).toBe(true)
      expect(parse([CMD, '--bool', '--other', 'value'])).toEqual({
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
      expect(parse([CMD])).toEqual({
        a1: false,
        b: false,
        other: '',
      })
      expect(parse([CMD, '-ab'])).toEqual({
        a1: true,
        b: true,
        other: '',
      })
      expect(parse([CMD, '-ca'])).toEqual({
        a1: true,
        b: true,
        other: '',
      })
      expect(parse([CMD, '-abo', 'test'])).toEqual({
        a1: true,
        b: true,
        other: 'test',
      })
      expect(() => parse([CMD, '-abo'])).toThrowError(/must be a string: -abo/)
    })
  })

  describe('number', () => {
    it('sets to NaN by default', () => {
      const {parse} = argparse({
        a: {
          type: 'number',
        },
      })
      expect(parse([CMD])).toEqual({
        a: NaN,
      })
      expect(() => parse([CMD, '-a'])).toThrowError(/must be a number: -a/)
      expect(() => parse([CMD, '-a', 'no-number']))
      .toThrowError(/must be a number: -a/)
      expect(() => parse([CMD, '--a', 'no-number']))
      .toThrowError(/must be a number: --a/)
      expect(parse([CMD, '-a', '10'])).toEqual({
        a: 10,
      })
      expect(parse([CMD, '--a', '11'])).toEqual({
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
      expect(() => parse([CMD, '--choice', 'c'])).toThrowError(/one of: a, b$/)
      expect(() => parse([CMD, '--num', '3']))
      .toThrowError(/must be one of: 1, 2$/)
      expect(parse([CMD, '--choice', 'a', '--num', '1'])).toEqual({
        choice: 'a',
        num: 1,
      })
      expect(parse([CMD, '--choice', 'b', '--num', '2'])).toEqual({
        choice: 'b',
        num: 2,
      })
    })
  })

  describe('string[] and n', () => {
    it('has a value of n = 1 by default', () => {
      const {parse} = argparse({
        value: {
          type: 'string[]',
        },
        help: arg('boolean'),
      }, '', exit, log)
      expect(parse([CMD]).value).toEqual([])
      expect(parse([CMD, '--value', 'one']).value).toEqual(['one'])
      parse([CMD, '--help'])
      expect(log.mock.calls[0][0]).toEqual([
        `${CMD} [OPTIONS]`,
        '',
        'Options:',
        '      --value [VALUE]',
        '      --help boolean',
      ].join('\n'))
    })
    it('can be used to extract finite number of values', () => {
      const {parse} = argparse({
        value: {
          type: 'string[]',
          n: 3,
        },
        other: {
          type: 'number',
          alias: 'o',
        },
        help: arg('boolean'),
      }, '', exit, log)
      expect(parse([CMD]).value).toEqual([])
      expect(parse([CMD, '--value', 'a', 'b', '--other', '-o', '3'])).toEqual({
        value: ['a', 'b', '--other'],
        other: 3,
        help: false,
      })
      parse([CMD, '--help'])
      expect(log.mock.calls[0][0]).toEqual([
        `${CMD} [OPTIONS]`,
        '',
        'Options:',
        '      --value [VALUE1 VALUE2 VALUE3]',
        '  -o, --other number',
        '      --help boolean',
      ].join('\n'))
    })
    it('can be used to collect any remaining arguments when n = "+"', () => {
      const {parse} = argparse({
        value: arg('string[]', {n: '+', required: true}),
        other: arg('number'),
        help: arg('boolean'),
      }, '', exit, log)
      expect(() => parse([CMD])).toThrowError(/Missing required args: value/)
      expect(parse([CMD, '--value', 'a', '--other', '3'])).toEqual({
        value: ['a', '--other', '3'],
        other: NaN,
        help: false,
      })
      expect(parse([CMD, '--other', '2', '--value', 'a', '--other', '3']))
      .toEqual({
        value: ['a', '--other', '3'],
        other: 2,
        help: false,
      })
      parse([CMD, '--help'])
      expect(log.mock.calls[0][0]).toEqual([
        `${CMD} [OPTIONS]`,
        '',
        'Options:',
        '      --value VALUE...          (required)',
        '      --other number',
        '      --help boolean',
      ].join('\n'))
    })
    it('can collect remaining positional arguments when n = "*"', () => {
      const {parse} = argparse({
        value: arg('string[]', {n: '*', required: true, positional: true}),
        other: arg('number'),
        help: arg('boolean'),
      }, '', exit, log)
      expect(parse([CMD, 'a', 'b']).value).toEqual(['a', 'b'])
      expect(() => parse([CMD, '--other', '3']).value)
      .toThrowError(/Missing.*: value/)
      expect(parse([CMD, '--other', '2', '--', '--other', '3'])).toEqual({
        value: ['--other', '3'],
        other: 2,
        help: false,
      })
      expect(parse([CMD, '--', '--other', '3'])).toEqual({
        value: ['--other', '3'],
        other: NaN,
        help: false,
      })
      expect(parse([CMD, '--other', '3', 'a', 'b', 'c'])).toEqual({
        value: ['a', 'b', 'c'],
        other: 3,
        help: false,
      })
      parse([CMD, '--help'])
      expect(log.mock.calls[0][0]).toEqual([
        `${CMD} [OPTIONS] [VALUE...]`,
        '',
        'Positional arguments:',
        '  VALUE string[]                (required)',
        '',
        'Options:',
        '      --other number',
        '      --help boolean',
      ].join('\n'))
    })
  })

  describe('positional', () => {
    it('can be defined', () => {
      const {parse} = argparse({
        a: {
          type: 'number',
          positional: true,
        },
      }, '', exit, log)
      expect(parse([CMD]).a).toBe(NaN)
      expect(parse([CMD, '12']).a).toBe(12)
      parse([CMD, '--help'])
      expect(log.mock.calls[0][0]).toEqual(`${CMD} [A]

Positional arguments:
  A number`)
    })
    it('works with booleans', () => {
      const {parse} = argparse({
        a: {
          type: 'boolean',
          positional: true,
        },
      })
      expect(parse([CMD]).a).toBe(false)
      expect(parse([CMD, 'true']).a).toBe(true)
      expect(parse([CMD, 'false']).a).toBe(false)
      expect(() => parse([CMD, 'invalid'])).toThrowError(/true or false/)
    })
    it('works with strings', () => {
      const {parse} = argparse({
        a: {
          type: 'string',
          positional: true,
        },
      })
      expect(parse([CMD]).a).toBe('')
      expect(parse([CMD, 'a']).a).toBe('a')
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
      expect(parse([CMD, 'aaa', 'bbb'])).toEqual({
        a: 'aaa',
        b: 'bbb',
      })
    })
    it('works amongst regular arguments', () => {
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
      expect(parse([CMD, '--arg1', 'one', '--arg3', 'three', '2'])).toEqual({
        arg1: 'one',
        arg2: 2,
        arg3: 'three',
      })
      expect(parse([CMD, '2'])).toEqual({
        arg1: '',
        arg2: 2,
        arg3: '',
      })
    })
  })

  describe('help', () => {
    it('prints help string and exits', () => {
      const {parse} = argparse({
        one: arg('string'),
        two: arg('number'),
        three: arg('boolean'),
        help: arg('boolean'),
      }, 'This command does something', exit, log)
      expect(exit.mock.calls.length).toBe(0)
      parse([CMD, '--help'])
      expect(exit.mock.calls.length).toBe(1)
      expect(log.mock.calls[0][0]).toEqual([
        `${CMD} [OPTIONS]`,
        '',
        'This command does something',
        '',
        'Options:',
        '      --one string',
        '      --two number',
        '      --three boolean',
        '      --help boolean',
      ].join('\n'))
    })
    it('returns help string with alias, description, and samples', () => {
      const {parse} = argparse({
        one: arg('string', {
          description: 'first argument',
          required: true,
          choices: ['choice-1', 'choice-2'],
          default: 'choice-1',
          alias: 'o',
        }),
        two: arg('number', {
          positional: true,
          required: true,
        }),
        three: arg('number', {
          positional: true,
        }),
        help: arg('boolean'),
      }, '', exit, log)
      expect(exit.mock.calls.length).toBe(0)
      parse([CMD, '--help'])
      expect(exit.mock.calls.length).toBe(1)
      expect(log.mock.calls[0][0]).toEqual([
        `${CMD} [OPTIONS] TWO [THREE]`,
        '',
        'Positional arguments:',
        '  TWO number                    (required)',
        '  THREE number',
        '',
        'Options:',
        '  -o, --one string              first argument ' +
            '(required, default: choice-1, choices: choice-1,choice-2)',
        '      --help boolean',
      ].join('\n'))
    })

  })

  it('throws when required args missing', () => {
    expect(() => argparse({
      one: {
        type: 'string',
        required: true,
      },
    }).parse([CMD])).toThrowError(/missing required/i)
  })

  it('throws when arg type is unknown', () => {
    expect(() => argparse({
      a: {
        type: 'test',
      } as any,  // eslint-disable-line
    }).parse([CMD, '-a'])).toThrowError(/Unknown type: test/)
  })

})
