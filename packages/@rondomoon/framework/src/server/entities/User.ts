import {Column, Entity, PrimaryGeneratedColumn, OneToMany} from 'typeorm'
import {UserEmail} from './UserEmail'
import {Session} from './Session'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @OneToMany(type => UserEmail, email => email.user)
  emails!: UserEmail[]

  // bcrypt encoded password
  @Column({nullable: true, length: '60', select: false})
  password?: string

  @OneToMany(type => Session, session => session.user)
  sessions!: Session[]
}
