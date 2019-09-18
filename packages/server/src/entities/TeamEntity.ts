import { EntitySchema } from 'typeorm'
import { Team } from '@rondo.dev/common'
import { BaseEntitySchemaPart } from './BaseEntitySchemaPart'

export const TeamEntity = new EntitySchema<Team>({
  name: 'team',
  columns: {
    ...BaseEntitySchemaPart,
    name: {
      type: String,
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
    userTeams: {
      type: 'one-to-many',
      target: 'user_team',
      inverseSide: 'team',
    },
  },
  indices: [{
    columns: ['userId'],
  }],
})
