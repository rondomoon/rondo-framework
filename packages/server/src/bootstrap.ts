import {config} from './config'
import {Bootstrap} from './application/Bootstrap'
import {configureServer} from './application/configureServer'

export default new Bootstrap({
  config,
  configureServer,
})
