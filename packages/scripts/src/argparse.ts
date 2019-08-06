export {arg} from '@rondo/argparse'
import {info} from './log'
import {
  argparse as configure, IArgsConfig, isHelp, TArgs
} from '@rondo/argparse'

export let exit = () => process.exit()

export function argparse<T extends IArgsConfig>(config: T) {
  const parser = configure(config)
  return {
    ...parser,
    parse(args: string[]): TArgs<T> {
      const result = parser.parse(args)
      if ('help' in config && isHelp(args)) {
        info(parser.help())
        exit()
      }
      return result
    },
  }
}
