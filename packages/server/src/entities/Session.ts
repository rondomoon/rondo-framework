import {ISession} from '../session/ISession'
import {Column, Entity, PrimaryColumn, Index, ManyToOne} from 'typeorm'
import {User} from './User'

@Entity()
export class Session implements ISession {
  @PrimaryColumn()
  id!: string

  @Index()
  @Column({type: 'bigint'})
  expiredAt: number = Date.now()

  @ManyToOne(type => User, user => user.sessions)
  user?: User

  @Column({ nullable: true })
  userId!: number

  @Column('text')
  json = ''
}
