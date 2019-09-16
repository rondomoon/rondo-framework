import { Column, Entity, OneToMany } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { Session } from './Session'
import { UserEmail } from './UserEmail'
import { UserTeam } from './UserTeam'

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
