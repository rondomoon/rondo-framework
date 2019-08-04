import {ILogger} from '@rondo/common'

const noop = () => undefined

export const noopLogger: ILogger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop,
  verbose: noop,
}
