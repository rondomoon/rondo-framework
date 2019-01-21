import {BaseEntity} from './BaseEntity'
import {Column, Entity} from 'typeorm'

@Entity()
export class Role extends BaseEntity {
  @Column()
  name!: string
}
