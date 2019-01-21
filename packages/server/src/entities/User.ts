import {BaseEntity} from './BaseEntity'
import {Column, Entity, OneToMany} from 'typeorm'
import {Comment} from './Comment'
import {Session} from './Session'
import {Site} from './Site'
import {UserTeam} from './UserTeam'
import {UserEmail} from './UserEmail'

@Entity()
export class User extends BaseEntity {
  @OneToMany(type => UserEmail, email => email.user)
  emails!: UserEmail[]

  // bcrypt encoded password
  @Column({nullable: true, length: '60', select: false})
  password?: string

  @OneToMany(type => Session, session => session.user)
  sessions!: Session[]

  @OneToMany(type => Site, site => site.user)
  sites!: Site[]

  @OneToMany(type => Comment, comment => comment.user)
  comments!: Comment[]

  @OneToMany(type => UserTeam, userTeam => userTeam.user)
  userTeams!: UserTeam[]
}
