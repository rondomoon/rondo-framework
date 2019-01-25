import {ISite} from '@rondo/common'

export interface ISiteService {
  create(name: string, teamId: number, userId: number): Promise<ISite>

  findOne(id: number, teamId: number): Promise<ISite | undefined>

  findByUser(userId: number): Promise<ISite[]>

  findByTeam(teamId: number): Promise<ISite[]>

  findByDomain(domain: string): Promise<ISite | undefined>

  // TODO add other methods
}