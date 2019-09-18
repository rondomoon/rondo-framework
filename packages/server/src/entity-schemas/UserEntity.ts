import { BaseEntitySchemaPart } from './BaseEntitySchemaPart'
import { EntitySchema } from 'typeorm'
import { User } from '@rondo.dev/common'

export const UserEntity = new EntitySchema<User>({
  name: 'user',
  columns: {
    ...BaseEntitySchemaPart,
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    password: {
      type: String,
      length: 60,
      select: false,
      nullable: true,
    },
  },
  relations: {
    emails: {
      type: 'one-to-many',
      target: 'user_email',
    },
    sessions: {
      type: 'one-to-many',
      target: 'session',
    },
    userTeams: {
      type: 'one-to-many',
      target: 'team',
    },
  },
})
