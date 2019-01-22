import {BaseEntity} from './BaseEntity'
import {Column, Entity, Index, ManyToOne, OneToMany} from 'typeorm'
import {User} from './User'
import {Story} from './Story'
import {Team} from './Team'

@Entity()
export class Site extends BaseEntity {
  @Column()
  name!: string

  @Column({ unique: true })
  domain!: string

  @Index()
  @Column()
  userId!: number

  @ManyToOne(type => User, user => user.sites)
  user?: User

  @Index()
  @Column()
  teamId!: number

  @ManyToOne(type => Team, team => team.sites)
  team?: Team

  @OneToMany(type => Story, story => story.site)
  stories!: Story[]
}
