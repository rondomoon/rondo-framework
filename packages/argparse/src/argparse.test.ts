import {argparse} from './argparse'

describe('argparse', () => {

  it('parses args', () => {
    const args = argparse(['--one', '1', '--two', '2', '--four'], {
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
      }
    })

    const one: string = args.one
    const two: number = args.two
    const four: boolean = args.four

    expect(one).toBe('1')
    expect(two).toBe(2)
    expect(four).toBe(true)
  })

  it('throws when required args missing', () => {
    expect(() => argparse([], {
      one: {
        type: 'string',
        required: true,
      },
    })).toThrowError(/missing required/i)
  })
})
