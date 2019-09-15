import {Logger} from '@rondo.dev/logger'

const noop = () => undefined

export const noopLogger: Logger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop,
  verbose: noop,
}
