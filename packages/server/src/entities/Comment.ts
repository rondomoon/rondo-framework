import {Column, Entity, Index, ManyToOne} from 'typeorm'
import {User} from './User'
import {Story} from './Story'
import {BaseEntity} from './BaseEntity'

@Entity()
export class Comment extends BaseEntity {
  @Column({type: 'text'})
  message!: string

  @ManyToOne(type => Story, story => story.comments)
  story?: Story

  @Column()
  @Index()
  storyId!: number

  @ManyToOne(type => User, user => user.comments)
  user?: User

  @Column()
  userId!: number

  @Column({nullable: true})
  parentId!: number

  @Column()
  spams!: number

  @Column()
  votes!: number
}
