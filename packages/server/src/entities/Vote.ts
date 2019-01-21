import {BaseEntity} from './BaseEntity'
import {Column, Entity, ManyToOne} from 'typeorm'
import {Comment} from './Comment'
import {User} from './User'

@Entity()
export class Vote extends BaseEntity {
  @ManyToOne(type => User)
  user?: User

  @Column()
  userId!: number

  @ManyToOne(type => Comment)
  comment?: Comment

  @Column()
  commentId!: number
}
