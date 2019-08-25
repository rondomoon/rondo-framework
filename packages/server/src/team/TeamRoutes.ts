import {AsyncRouter} from '../router'
import {BaseRoute} from '../routes/BaseRoute'
import {IAPIDef} from '@rondo.dev/common'
import {ITeamService} from './ITeamService'
import {IUserPermissions} from '../user/IUserPermissions'
import {ensureLoggedInApi} from '../middleware'

export class TeamRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly teamService: ITeamService,
    protected readonly permissions: IUserPermissions,
    protected readonly t: AsyncRouter<IAPIDef>,
  ) {
    super(t)
  }

  setup(t: AsyncRouter<IAPIDef>) {

    const ensureLoggedIn = [ensureLoggedInApi]

    t.get('/teams/:id', ensureLoggedIn, async req => {
      const {id} = req.params
      return this.teamService.findOne(id)
    })

    t.get('/my/teams', ensureLoggedIn, async req => {
      return this.teamService.find(req.user!.id)
    })

    t.post('/teams', ensureLoggedIn, async req => {
      const {name} = req.body
      return this.teamService.create({
        name,
        userId: req.user!.id,
      })
    })

    t.put('/teams/:id', ensureLoggedIn, async req => {
      const id = Number(req.params.id)

      await this.permissions.belongsToTeam({
        teamId: id,
        userId: req.user!.id,
      })

      return this.teamService.update({
        id,
        name: req.body.name,
        userId: req.user!.id,
      })
    })

    t.delete('/teams/:id', ensureLoggedIn, async req => {
      const id = Number(req.params.id)

      await this.permissions.belongsToTeam({
        teamId: id,
        userId: req.user!.id,
      })

      return this.teamService.remove({
        id,
        userId: req.user!.id,
      })
    })

    t.get('/teams/:teamId/users', ensureLoggedIn, async req => {
      const teamId = Number(req.params.teamId)

      await this.permissions.belongsToTeam({
        teamId,
        userId: req.user!.id,
      })

      return this.teamService.findUsers(teamId)
    })

    t.post('/teams/:teamId/users/:userId', ensureLoggedIn, async req => {
      const teamId = Number(req.params.teamId)
      const userId = Number(req.params.userId)

      await this.permissions.belongsToTeam({
        teamId,
        userId: req.user!.id,
      })

      return this.teamService.addUser({
        userId,
        teamId,
        roleId: 1,  // TODO customize roles
      })
    })

    t.delete('/teams/:teamId/users/:userId', ensureLoggedIn, async req => {
      const teamId = Number(req.params.teamId)
      const userId = Number(req.params.userId)

      await this.permissions.belongsToTeam({
        teamId,
        userId: req.user!.id,
      })

      await this.teamService.removeUser({
        teamId,
        userId,
        roleId: 1,  // TODO customzie roles
      })

      return {teamId, userId}
    })

  }

}
