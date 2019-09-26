import { ClientConfig } from '@rondo.dev/client'

export interface Sink {
  pipe<Config extends ClientConfig, State>(
    reactStream: NodeJS.ReadableStream,
    htmlStream: NodeJS.WritableStream,
    config: Config,
    state: State,
  ): Promise<void>
}
