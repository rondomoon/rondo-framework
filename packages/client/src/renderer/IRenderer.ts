import {IAPIDef} from '@rondo/common'
import {IClientConfig} from './IClientConfig'
import {Store} from 'redux'

export interface IRenderer {
  render<State>(
    url: string,
    store: Store<State>,
    config: IClientConfig,
  ): any
}
