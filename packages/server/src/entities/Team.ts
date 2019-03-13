import {BaseEntity} from './BaseEntity'
import {Column, Entity, OneToMany, ManyToOne, Index} from 'typeorm'
import {UserTeam} from './UserTeam'
import {User} from './User'

@Entity()
export class Team extends BaseEntity {
  @Column()
  name!: string

  @Column()
  @Index()
  userId!: number

  @ManyToOne(type => User)
  user?: User

  @OneToMany(type => UserTeam, userTeam => userTeam.team)
  userTeams!: UserTeam[]
}
