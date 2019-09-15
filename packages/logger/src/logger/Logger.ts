type ILogFunction = (message: string, ...meta: unknown[]) => void

export interface Logger {
  error: ILogFunction
  warn: ILogFunction
  info: ILogFunction
  debug: ILogFunction
  verbose: ILogFunction
}
