type ILogFunction = (message: string, ...meta: any[]) => void

export interface ILogger {
  error: ILogFunction
  warn: ILogFunction
  info: ILogFunction
  debug: ILogFunction
  verbose: ILogFunction
}
