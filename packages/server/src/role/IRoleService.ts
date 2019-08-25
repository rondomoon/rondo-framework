import {IRole} from '@rondo.dev/common'

export interface IRoleService {
  create(name: string): Promise<IRole>
}
