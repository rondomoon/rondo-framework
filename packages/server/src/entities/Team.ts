import {BaseEntity} from './BaseEntity'
import {Column, Entity, OneToMany, ManyToOne, Index} from 'typeorm'
import {Site} from './Site'
import {UserTeam} from './UserTeam'
import {User} from './User'

@Entity()
export class Team extends BaseEntity {
  @Column()
  url!: string

  @Column()
  @Index()
  userId!: number

  @ManyToOne(type => User)
  @Column()
  user?: User

  @OneToMany(type => Site, site => site.team)
  sites!: Site[]

  @OneToMany(type => UserTeam, userTeam => userTeam.team)
  userTeams!: UserTeam[]
}