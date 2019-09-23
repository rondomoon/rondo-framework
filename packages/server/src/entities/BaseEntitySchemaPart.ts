import { EntitySchemaColumnOptions } from 'typeorm'

const transformer = {
  from: (value: Date) => !isNaN(value.getTime()) ? value.toISOString() : value,
  to: (value: undefined | null | string) => value ? new Date(value) : value,
}

export const BaseEntitySchemaPart: {
  id: EntitySchemaColumnOptions
  createDate: EntitySchemaColumnOptions
  updateDate: EntitySchemaColumnOptions
} = {
  id: {
    type: Number,
    primary: true,
    generated: true,
  },
  createDate: {
    type: Date,
    createDate: true,
    transformer,
  },
  updateDate: {
    type: Date,
    updateDate: true,
    transformer,
  },
}
