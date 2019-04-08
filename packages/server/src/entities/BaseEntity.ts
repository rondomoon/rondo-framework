import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

const transformer = {
  from: (value: Date) => value.toISOString(),
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
