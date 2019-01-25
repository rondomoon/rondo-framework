import {ISite} from '@rondo/common'
import {ISiteCreateParams} from './ISiteCreateParams'

export interface ISiteService {
  create(params: ISiteCreateParams): Promise<ISite>

  findOne(id: number, teamId: number): Promise<ISite | undefined>

  findByUser(userId: number): Promise<ISite[]>

  findByTeam(teamId: number): Promise<ISite[]>

  findByDomain(domain: string): Promise<ISite | undefined>

  // TODO add other methods
}
