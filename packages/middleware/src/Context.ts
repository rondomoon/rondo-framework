import { IncomingMessage, ServerResponse } from 'http'

export type Context = {
  req: IncomingMessage
  res: ServerResponse
}
