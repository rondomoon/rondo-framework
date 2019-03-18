import {BaseEntity} from './BaseEntity'
import {Column, Entity, OneToMany} from 'typeorm'
import {Session} from './Session'
import {UserTeam} from './UserTeam'
import {UserEmail} from './UserEmail'

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName!: string

  @Column()
  lastName!: string

  @OneToMany(type => UserEmail, email => email.user)
  emails!: UserEmail[]

  // bcrypt encoded password
  @Column({nullable: true, length: '60', select: false})
  password?: string

  @OneToMany(type => Session, session => session.user)
  sessions!: Session[]

  @OneToMany(type => UserTeam, userTeam => userTeam.user)
  userTeams!: UserTeam[]
}
