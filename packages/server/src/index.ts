if (require.main === module) {
  if (!process.env.LOG) {
    process.env.LOG = 'api,sql:warn'
  }
}
export * from './application'
export * from './database'
export * from './entities'
export * from './error'
export * from './logger'
export * from './middleware'
export * from './router'
export * from './routes'
export * from './services'
export * from './session'

import * as rpc from './rpc'
export {rpc}

import bootstrap from './bootstrap'

if (require.main === module) {
  bootstrap.exec(process.argv[2])
}
