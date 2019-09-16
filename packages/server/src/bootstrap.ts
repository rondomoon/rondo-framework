import { CLIBootstrap } from './application'
import { configureServer } from './application/configureServer'
import { config } from './config'

export default new CLIBootstrap({
  config,
  configureServer,
})
