import { EntitySchema } from 'typeorm'
import { Role } from '@rondo.dev/common'
import { BaseEntitySchemaPart } from './BaseEntitySchemaPart'

export const RoleEntity = new EntitySchema<Role>({
  name: 'role',
  columns: {
    ...BaseEntitySchemaPart,
    name: {
      type: String,
      unique: true,
    },
  },
})
