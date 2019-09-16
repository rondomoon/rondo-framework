import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm'
import { DefaultSession } from '../session/DefaultSession'
import { User } from './User'

@Entity()
export class Session implements DefaultSession {
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
