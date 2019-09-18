import { BaseEntitySchemaPart } from './BaseEntitySchemaPart'
import { EntitySchema } from 'typeorm'
import { UserEmail } from '@rondo.dev/common'

export const UserEmailEntity = new EntitySchema<UserEmail>({
  name: 'user_email',
  columns: {
    ...BaseEntitySchemaPart,
    email: {
      type: String,
      unique: true,
    },
    userId: {
      type: Number,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'user',
    },
  },
})
