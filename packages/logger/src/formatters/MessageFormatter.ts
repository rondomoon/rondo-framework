import { IFormatter } from './IFormatter'
import { IMessage } from '../IMessage'
import { LogLevel } from '../LogLevel'
import { format } from 'util'

function padleft(str: string, len: number) {
  if (str.length > len) {
    return str.substring(0, len)
  }
  while (str.length < len) {
    str += ' '
  }
  return str
}

export class MessageFormatter implements IFormatter {
  format(message: IMessage) {
    message.message = format(
      '%s %s %s',
      message.loggerName,
      padleft(LogLevel[message.level], 5),
      format(message.message, ...message.params),
    )
    return message
  }
}
