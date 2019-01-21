import {BaseEntity} from './BaseEntity'
import {Column, Entity, ManyToOne} from 'typeorm'
import {User} from './User'
import {Comment} from './Comment'

@Entity()
export class Spam extends BaseEntity {
  @ManyToOne(type => User)
  user?: User

  @Column()
  userId!: number

  @ManyToOne(type => Comment)
  comment?: Comment

  @Column()
  commentId!: number
}
