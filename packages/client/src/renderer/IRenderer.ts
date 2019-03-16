import {IClientConfig} from './IClientConfig'

export interface IRenderer {
  render(config: IClientConfig, state?: any): any
}
