import { IMessage } from '../IMessage'

export interface IFormatter {
  format(message: IMessage): IMessage
}
