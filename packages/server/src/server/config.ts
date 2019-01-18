import cfg from 'config'
import {IConfig} from './application'
import URL from 'url'

const baseUrl =  URL.parse(cfg.get('app.baseUrl'))

export const config: IConfig = {
  app: {
    name: cfg.get('app.name'),
    baseUrl,
    context: baseUrl.path!,
    session: {
      name: cfg.get('app.session.name'),
      secret: cfg.get('app.session.secret'),
    },
    db: cfg.get('app.db'),
  },
}
