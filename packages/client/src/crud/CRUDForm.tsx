import React from 'react'
import {Control, Field, Label, Icon, Input} from 'bloomer'
import {ICRUDChangeParams} from './CRUDActions'

export type TCRUDFieldType = 'text' | 'password' | 'number' | 'email' | 'tel'

export interface ICRUDFieldProps<T> {
  id?: number
  onChange<K extends keyof T>(params: ICRUDChangeParams<T>): void
  Icon?: React.ComponentType
  error?: string
  label: string
  placeholder?: string
  name: keyof T & string
  type: TCRUDFieldType
  value: string
}

export type TCRUDErrors<T> = Partial<Record<keyof T & string, string>>

export interface ICRUDField<T> {
  Icon?: React.ComponentType
  label: string
  placeholder?: string
  name: keyof T & string
  type: TCRUDFieldType
}

export interface ICRUDFormProps<T> {
  errors: TCRUDErrors<T>
  id?: number
  item?: T
  error: string
  submitText: string
  fields: Array<ICRUDField<T>>

  onSubmit: (t: T) => void
  onChange(params: ICRUDChangeParams<T>): void
}

export class CRUDField<T> extends React.PureComponent<ICRUDFieldProps<T>> {
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {onChange} = this.props
    const {value} = e.target
    onChange({
      id: this.props.id,
      key: this.props.name,
      value,
    })
  }
  render() {
    const {label, name, value, placeholder} = this.props
    return (
      <Field>
        <Label>{label}</Label>
        <Control hasIcons={!!this.props.Icon}>
          <Input
            name={name}
            onChange={this.handleChange}
            placeholder={placeholder}
            value={value}
          />
          {!!this.props.Icon && (
            <Icon isSize='small' isAlign='left'>
              <this.props.Icon />
            </Icon>
          )}
        </Control>
      </Field>
    )
  }
}

export class CRUDForm<T> extends React.PureComponent<ICRUDFormProps<T>> {
  static defaultProps = {
    errors: {},
  }
  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const {onSubmit, item} = this.props
    if (item) {
      onSubmit(item)
    }
  }
  render() {
    const {fields, item} = this.props
    return (
      <form onSubmit={this.handleSubmit}>
        <p className='error'>{this.props.error}</p>
        {fields.map(field => {
          const error = this.props.errors[field.name]
          const value = item ? [field.name] : ''
          return (
            <CRUDField<T>
              id={this.props.id}
              key={field.name}
              name={field.name}
              label={field.label}
              onChange={this.props.onChange}
              placeholder={field.placeholder}
              error={error}
              Icon={field.Icon}
              value={String(value)}
              type={field.type}
            />
          )
        })}
        <div className='center'>
          <input
            className='button is-primary'
            name='submit'
            type='submit'
            value={this.props.submitText}
          />
        </div>
      </form>
    )
  }
}
