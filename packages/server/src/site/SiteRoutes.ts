import {AsyncRouter} from '../router'
import {BaseRoute} from '../routes/BaseRoute'
import {IAPIDef} from '@rondo/common'
import {ISiteService} from './ISiteService'
import {ensureLoggedInApi} from '../middleware'
import {IUserPermissions} from '../user/IUserPermissions'

export class SiteRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly siteService: ISiteService,
    protected readonly permissions: IUserPermissions,
    t: AsyncRouter<IAPIDef>,
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
      const {name, domain} = req.body
      const {teamId} = req.params

      await this.permissions.belongsToTeam({
        teamId,
        userId: req.user!.id,
      })
      return this.siteService.create({
        name,
        domain,
        teamId,
        userId: req.user!.id,
      })
    })

  }

}
