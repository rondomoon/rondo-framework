import { ClientConfig } from '@rondo.dev/client'
import { BulkActions, BulkClient } from '@rondo.dev/jsonrpc'
import express from 'express'
import { Store } from 'redux'
import { ServerRenderer, HTMLSink } from '../react'
import { Middleware } from './Middleware'
import { Handler } from './Handler'
import { apiLogger } from '../logger'
import { IncomingHttpHeaders } from 'http'

type ServiceFactory<Services> = (req: express.Request) =>
  BulkActions<BulkClient<Services>>

interface ServerSideRendererParams<Props, State> {
  readonly appName: string
  readonly assetsPaths: string[]
  readonly Application: React.ComponentType<Props>
  // TODO remove headers parameter and figure out how to do without it
  readonly buildProps: (
    config: ClientConfig, headers: IncomingHttpHeaders) => Props
  readonly buildStore: (config: ClientConfig) => Store<State>
}

export class Frontend<Services, Props, State> implements Middleware {
  readonly handle: Handler
  readonly renderer: ServerRenderer<Props>
  readonly sink = new HTMLSink()

  constructor(
    readonly params: ServerSideRendererParams<Props, State>,
  ) {
    const router = express.Router()
    this.renderer = new ServerRenderer(params.Application)

    this.configure(router)
    this.handle = router
  }

  protected configure(router: express.Router) {
    const {appName} = this.params
    this.params.assetsPaths.forEach(path => {
      apiLogger.info('Using assets path: %s', path)
      router.use('/assets', express.static(path))
    })

    router.get('/*', (request, response, next) => (async (req, res) => {
      const {baseUrl} = req
      const csrfToken = req.csrfToken()
      const config: ClientConfig = {
        appName,
        baseUrl,
        csrfToken,
        user: req.user,
      }

      const store = this.params.buildStore(config)
      const props = this.params.buildProps(config, req.headers)

      try {
        const stream = await this.renderer.render(req.url, store, props, config)
        const state = store.getState()
        await this.sink.pipe(stream, res, config, state)
      } catch (err) {
        // TODO test thoroughly if the fix below works
        apiLogger.error('Error in React SSR: %s', err.stack)
        if (!res.writable) {
          return
        }
        if (res.headersSent) {
          res.write('An error occurred')
          res.end()
        } else {
          res.status(500)
          res.send('An error occurred')
        }
      }
    })(request, response))

  }

}
