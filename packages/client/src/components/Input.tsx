import React from 'react'
import {Control, Field, Input as I, Label} from 'bloomer'
import {IconType} from 'react-icons'

export interface IInputProps {
  name: string
  type: 'text' | 'password' | 'hidden' | 'submit' | 'email'
  value?: string
  onChange?: (name: this['name'], value: string) => void
  placeholder?: string
  readOnly?: boolean
  label: string
  Icon?: IconType
}

export class Input extends React.PureComponent<IInputProps> {
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(this.props.name, e.target.value)
    }
  }
  render() {
    const {Icon} = this.props
    return (
      <Field>
        <Label>{this.props.label}</Label>
        <Control hasIcons>
          <I
            className='input'
            name={this.props.name}
            type={this.props.type}
            value={this.props.value}
            onChange={this.handleChange}
            placeholder={this.props.placeholder}
            readOnly={!!this.props.readOnly}
          />
          {Icon && <span className='icon is-left is-small'>
            <Icon />
          </span>}
        </Control>
      </Field>
    )
  }
}
