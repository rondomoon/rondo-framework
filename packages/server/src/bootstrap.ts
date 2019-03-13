if (!process.env.LOG) {
  process.env.LOG = 'api,sql:warn'
}

import {config} from './config'
import {Bootstrap} from './application/Bootstrap'

export const bootstrap = new Bootstrap(config)
// FIXME determine a port by parsing app url from config
const port: string | number = process.env.PORT || 3000

bootstrap.listen(port)
