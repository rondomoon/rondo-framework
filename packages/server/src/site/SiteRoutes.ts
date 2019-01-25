import {AsyncRouter} from '../router'
import {BaseRoute} from '../routes/BaseRoute'
import {IAPIDef} from '@rondo/common'
import {ISiteService} from './ISiteService'
import {ensureLoggedInApi} from '../middleware'

export class SiteRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly siteService: ISiteService,
    protected readonly t: AsyncRouter<IAPIDef>,
  ) {
    super(t)
  }

  setup(t: AsyncRouter<IAPIDef>) {

    t.get('/sites/:domain', async req => {
      const {domain} = req.params
      return this.siteService.findByDomain(domain)
    })

    t.get('/teams/:teamId/sites/:id', async req => {
      const {id, teamId} = req.params
      return this.siteService.findOne(id, teamId)
    })

    t.get('/teams/:teamId/sites', async req => {
      return this.siteService.findByTeam(req.params.teamId)
    })

    t.use(ensureLoggedInApi)

    t.get('/my/sites', async req => {
      return this.siteService.findByUser(req.user!.id)
    })

    t.post('/teams/:teamId/sites', async req => {
      const {name} = req.body
      const {teamId} = req.params
      return this.siteService.create(name, teamId, req.user!.id)
    })

  }

}
