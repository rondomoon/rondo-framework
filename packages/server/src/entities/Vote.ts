import {BaseEntity} from './BaseEntity'
import {Column, Entity, ManyToOne, Unique} from 'typeorm'
import {Comment} from './Comment'
import {User} from './User'

@Entity()
@Unique('vote_userid_commentid', ['userId', 'commentId'])
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
