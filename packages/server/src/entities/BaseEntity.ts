import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

const transformer = {
  from: (value: Date) => !isNaN(value.getTime()) ? value.toISOString() : value,
  to: (value: undefined | null | string) => value ? new Date(value) : value,
}

export abstract class BaseEntity {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id!: number

  @CreateDateColumn({transformer, type: 'datetime'})
  createDate!: string

  @UpdateDateColumn({transformer, type: 'datetime'})
  updateDate!: string
}
