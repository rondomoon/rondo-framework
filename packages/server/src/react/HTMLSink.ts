import { Sink } from './Sink'
import { ClientConfig } from '@rondo.dev/client'
import { apiLogger } from '../logger'

export type GetHeader = <Config extends ClientConfig>(config: Config) => string
export type GetFooter = <Config extends ClientConfig>(
  config: ClientConfig, stateJSON: string) => string

const getHeaderDefault: GetHeader = config => `<!DOCTYPE html><html>
<head>
  <meta charset='UTF-8'>
  <title>${config.appName}</title>
  <meta name="description" content="An embeddable discussion platform">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel='stylesheet' type='text/css'
    href='${config.baseUrl}/assets/style.css'>
  <link rel='icon' type='image/png' href='${config.baseUrl}/assets/logo-32.png'>
</head>
<body>
<div id="container">`

const getFooterDefault: GetFooter = (config, state) => `</div>
</body>
<script>
  window.__APP_CONFIG__ = ${JSON.stringify(config)};
  window.__PRELOADED_STATE__ = ${state};
</script>
<script src='${config.baseUrl}/assets/client.js'></script>
</html>`

export class HTMLSink implements Sink {

  constructor(
    protected readonly getHeader: GetHeader = getHeaderDefault,
    protected readonly getFooter: GetFooter = getFooterDefault,
  ) {

  }

  protected stringifyState<State>(state: State): string {
    // TODO figure out a better way to escape state JSON
    return JSON
    .stringify(state)
    .replace(/</g, '\\u003c')
  }

  async pipe<Config extends ClientConfig, State>(
    reactStream: NodeJS.ReadableStream,
    htmlStream: NodeJS.WritableStream,
    config: Config,
    state: State,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      htmlStream.write(this.getHeader(config))

      reactStream.on('error', (err: Error) => {
        apiLogger.error('Error in React SSR: %s', err.stack)
        reject(err)
      })

      reactStream.pipe(htmlStream, { end: false })

      reactStream.on('end', () => {
        htmlStream.write(this.getFooter(config, this.stringifyState(state)))
        htmlStream.end()
        resolve()
      })
    })
  }
}
