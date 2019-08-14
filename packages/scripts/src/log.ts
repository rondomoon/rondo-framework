import {format} from 'util'

export function error(message: string, ...values: any[]) {
  process.stderr.write(format(message + '\n', ...values))
}

export function info(message: string, ...values: any[]) {
  process.stdout.write(format(message + '\n', ...values))
}
