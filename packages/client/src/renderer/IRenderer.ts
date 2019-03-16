import {IClientConfig} from './IClientConfig'

export interface IRenderer {
  render(url: string, config: IClientConfig, state?: any): any
}
