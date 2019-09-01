import {format} from 'util'

export function error(message: string, ...values: any[]) {
  process.stderr.write(format(message, ...values) + '\n')
}

export function info(message: string, ...values: any[]) {
  process.stdout.write(format(message, ...values) + '\n')
}
