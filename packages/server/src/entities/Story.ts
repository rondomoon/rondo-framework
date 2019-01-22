import {BaseEntity} from './BaseEntity'
import {Column, Entity, ManyToOne} from 'typeorm'
import {Comment} from './Comment'
import {Site} from './Site'

@Entity()
export class Story extends BaseEntity {
  @Column({ unique: true })
  url!: string

  @Column()
  siteId!: number

  @ManyToOne(type => Site, site => site.stories)
  site?: Site

  @ManyToOne(type => Comment, comment => comment.story)
  comments!: Comment[]
}
