import {BaseEntity} from './BaseEntity'
import {Column, Entity, OneToMany} from 'typeorm'
import {Site} from './Site'
import {UserTeam} from './UserTeam'

@Entity()
export class Team extends BaseEntity {
  @Column()
  url!: string

  @OneToMany(type => Site, site => site.team)
  sites!: Site[]

  @OneToMany(type => UserTeam, userTeam => userTeam.team)
  userTeams!: UserTeam[]
}
