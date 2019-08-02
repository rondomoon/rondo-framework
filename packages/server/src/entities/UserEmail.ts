import {BaseEntity} from './BaseEntity'
import {Column, Entity, PrimaryGeneratedColumn, ManyToOne} from 'typeorm'
import {User} from './User'

@Entity()
export class UserEmail extends BaseEntity {
  @Column({unique: true})
  email!: string

  @ManyToOne(type => User, user => user.emails)
  user?: User

  @Column()
  userId?: number = undefined
}
