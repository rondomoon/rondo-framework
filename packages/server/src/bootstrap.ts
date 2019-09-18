import { ServerBootstrap } from './application'
import { configureServer } from './application/configureServer'
import { config } from './config'
import * as entities from './entity-schemas'
import * as migrations from './migrations'

export default new ServerBootstrap({
  config,
  entities,
  migrations,
  configureServer,
})
