import {BaseService} from '../services/BaseService'
import {IRoleService} from './IRoleService'
import {Role} from '../entities/Role'

export class RoleService extends BaseService implements IRoleService {
  create(name: string) {
    return this.getRepository(Role)
    .save({
      name,
    })
  }
}
