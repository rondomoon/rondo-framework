import { BaseEntitySchemaPart } from './BaseEntitySchemaPart'
import { EntitySchema } from 'typeorm'
import { UserTeam } from '@rondo.dev/common'

export const UserTeamEntity = new EntitySchema<UserTeam>({
  name: 'user_team',
  columns: {
    ...BaseEntitySchemaPart,
    userId: {
      type: Number,
    },
    teamId: {
      type: Number,
    },
    roleId: {
      type: Number,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'user',
    },
    team: {
      type: 'many-to-one',
      target: 'team',
    },
    role: {
      type: 'many-to-one',
      target: 'role',
    },
  },
})
