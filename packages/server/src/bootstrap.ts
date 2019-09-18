import { ServerBootstrap } from './application'
import { configureServer } from './application/configureServer'
import { config } from './config'
import * as entities from './entities'
import * as migrations from './migrations'

export default new ServerBootstrap({
  config,
  entities,
  migrations,
  configureServer,
})
