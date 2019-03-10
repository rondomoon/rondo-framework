import {ISite} from '@rondo/common'
import {ISiteCreateParams} from './ISiteCreateParams'
import {ISiteUpdateParams} from './ISiteUpdateParams'

export interface ISiteService {
  create(params: ISiteCreateParams): Promise<ISite>

  update(params: ISiteUpdateParams): Promise<ISite>

  remove(params: {id: number, teamId: number}): Promise<void>

  findOne(id: number, teamId: number): Promise<ISite | undefined>

  findByUser(userId: number): Promise<ISite[]>

  findByTeam(teamId: number): Promise<ISite[]>

  findByDomain(domain: string): Promise<ISite | undefined>

  // TODO add other methods
}
