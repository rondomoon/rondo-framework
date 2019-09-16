import { Column, Entity, ManyToOne } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { User } from './User'

@Entity()
export class UserEmail extends BaseEntity {
  @Column({unique: true})
  email!: string

  @ManyToOne(type => User, user => user.emails)
  user?: User

  @Column()
  userId?: number = undefined
}
