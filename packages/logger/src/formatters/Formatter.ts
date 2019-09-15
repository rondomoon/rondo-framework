import { Message } from '../Message'

export interface Formatter {
  format(message: Message): Message
}
