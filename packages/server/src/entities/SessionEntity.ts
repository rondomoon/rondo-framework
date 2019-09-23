import { Session } from '@rondo.dev/common'
import { EntitySchema } from 'typeorm'

export const SessionEntity = new EntitySchema<Session>({
  name: 'session',
  columns: {
    id: {
      type: String,
      primary: true,
    },
    expiredAt: {
      type: 'bigint',
      // default: () => Date.now(),
    },
    userId: {
      type: Number,
      nullable: true,
    },
    json: {
      type: 'text',
      // default: '',
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'user',
      inverseSide: 'sessions',
    },
  },
  indices: [{
    columns: ['expiredAt'],
  }],
})
