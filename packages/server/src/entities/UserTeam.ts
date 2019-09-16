import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Role } from './Role'
import { Team } from './Team'
import { User } from './User'

@Entity()
export class UserTeam extends BaseEntity {
  @ManyToOne(type => User, user => user.userTeams)
  user!: User

  @Column()
  userId!: number

  @ManyToOne(type => Team, team => team.userTeams)
  team?: Team

  @Column()
  teamId!: number

  @ManyToOne(type => Role)
  role?: Role

  @Column()
  roleId!: number
}
