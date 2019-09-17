import { APIDef } from '@rondo.dev/common'
import { createNamespace } from 'cls-hooked'
import { ServerBootstrap } from './application'
import { configureServer } from './application/configureServer'
import { config } from './config'
import { TestUtils } from './test-utils'

export const exit = jest.fn()

export const bootstrap = new ServerBootstrap({
  config,
  configureServer,
  namespace: createNamespace('test'),
  exit,
})

// TODO separate IAPIDef between projects
export const test = new TestUtils<APIDef>(bootstrap)
export const {request} = test
