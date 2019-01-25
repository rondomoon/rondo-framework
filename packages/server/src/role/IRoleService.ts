import {IRole} from '@rondo/common'

export interface IRoleService {
  create(name: string): Promise<IRole>
}
