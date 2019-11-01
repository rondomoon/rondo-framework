/// <reference path="../@types/express.d.ts" />
/// <reference path="../@types/react-ssr-prepass.d.ts" />
if (require.main === module) {
  if (!process.env.LOG) {
    process.env.LOG = 'api,sql:warn'
  }
}
export * from './application'
export * from './cli'
export * from './entities'
export * from './entities/BaseEntitySchemaPart'
export * from './error'
export * from './logger'
export * from './middleware'
export * from './react'
export * from './router'
export * from './routes'
export * from './rpc'
export * from './services'
export * from './session'

import * as rpc from './rpc'
export {rpc}

import bootstrap from './bootstrap'
import {run} from './cli'

if (require.main === module) {
  run(bootstrap, process.argv.slice(1))
}
