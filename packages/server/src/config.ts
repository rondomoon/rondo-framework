import ConfigReader from '@rondo.dev/config'
import {Config} from './application'
import URL from 'url'

const cfg = new ConfigReader(__dirname).read()

const baseUrl =  URL.parse(cfg.get('app.baseUrl'))

export const config: Config = {
  app: {
    name: cfg.get('app.name'),
    assets: cfg.get('app.assets'),
    baseUrl,
    context: baseUrl.path!,
    session: {
      name: cfg.get('app.session.name'),
      secret: cfg.get('app.session.secret'),
    },
    db: cfg.get('app.db'),
  },
}
