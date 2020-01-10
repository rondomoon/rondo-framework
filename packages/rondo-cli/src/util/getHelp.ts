import { padRight } from './pad'

export function getHelp(fn: (...args: string[]) => unknown): string {
  const name = fn.name
  const fn2 = fn as {help?: string}
  if (typeof fn2.help === 'string') {
    return padRight(name, 17) + ' ' + fn2.help
  }
  return name
}
