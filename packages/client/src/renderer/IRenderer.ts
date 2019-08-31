import {IAPIDef} from '@rondo.dev/common'
import {IClientConfig} from './IClientConfig'
import {Store} from 'redux'

export interface IRenderer<Props> {
  render<State>(
    url: string,
    store: Store<State>,
    props: Props,
    config: IClientConfig,
  ): any
}
