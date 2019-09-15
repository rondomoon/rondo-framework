import { Store } from 'redux'
import { ClientConfig } from './ClientConfig'

export interface Renderer<Props> {
  render<State>(
    url: string,
    store: Store<State>,
    props: Props,
    config: ClientConfig,
  ): unknown
}
