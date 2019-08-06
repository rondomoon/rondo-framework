import {format} from 'util'

const stdout: NodeJS.WriteStream = process.stdout
const stderr: NodeJS.WriteStream = process.stderr

export function error(message: string, ...values: any[]) {
  stderr.write(format(message + '\n', ...values))
}

export function info(message: string, ...values: any[]) {
  stdout.write(format(message + '\n', ...values))
}
