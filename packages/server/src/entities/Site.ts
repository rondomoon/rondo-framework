import {BaseEntity} from './BaseEntity'
import {Column, Entity, ManyToOne, OneToMany} from 'typeorm'
import {User} from './User'
import {Story} from './Story'
import {Team} from './Team'

@Entity()
export class Site extends BaseEntity {
  @Column()
  name!: string

  @Column()
  domain!: string

  @Column()
  userId!: number

  @ManyToOne(type => User, user => user.sites)
  user?: User

  @Column()
  teamId!: number

  @ManyToOne(type => Team, team => team.sites)
  team?: Team

  @OneToMany(type => Story, story => story.site)
  stories!: Story[]
}
