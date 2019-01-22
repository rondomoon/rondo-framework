import {BaseEntity} from './BaseEntity'
import {Column, Entity, ManyToOne, Unique} from 'typeorm'
import {User} from './User'
import {Comment} from './Comment'

@Entity()
@Unique('spam_userid_commentid', ['userId', 'commentId'])
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
