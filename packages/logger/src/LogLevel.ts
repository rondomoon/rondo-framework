export enum LogLevel {
  OFF,
  ERROR,
  WARN,
  INFO,
  DEBUG,
  VERBOSE,
}

export function isLogLevel(value: string): value is keyof typeof LogLevel {
  return LogLevel.hasOwnProperty(value) && isNaN(Number(value))
}
