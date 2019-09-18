import { EntitySchemaColumnOptions } from 'typeorm'

const transformer = {
  from: (value: Date) => !isNaN(value.getTime()) ? value.toISOString() : value,
  to: (value: undefined | null | string) => value ? new Date(value) : value,
}

export const BaseEntitySchemaPart: Record<
  'id' | 'createDate' | 'updateDate', EntitySchemaColumnOptions> = {
  id: {
    type: 'integer',
    primary: true,
    generated: true,
  },
  createDate: {
    type: 'datetime',
    createDate: true,
    transformer,
  },
  updateDate: {
    type: 'datetime',
    updateDate: true,
    transformer,
  },
}
