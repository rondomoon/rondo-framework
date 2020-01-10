import {format} from 'util'

export function error(message: string, ...values: Array<unknown>) {
  process.stderr.write(format(message, ...values) + '\n')
}

export function info(message: string, ...values: Array<unknown>) {
  process.stdout.write(format(message, ...values) + '\n')
}
