import React from 'react'
import {IconType} from 'react-icons'
import styled from 'styled-components'
import { Help } from './Help'

export interface InputProps {
  name: string
  error?: string
  type: 'text' | 'password' | 'hidden' | 'submit' | 'email'
  value?: string
  onChange?: (name: this['name'], value: string) => void
  placeholder?: string
  readOnly?: boolean
  label: string
  Icon?: IconType
  required?: boolean
}

export const Field = styled.div`
  margin-bottom: 1em;
`

export const Label = styled('label')`
  text-transform: uppercase;
  font-size: 0.8rem;
`

export const Control = styled.div`
  position: relative;
`

export const Icon = styled.span`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  left: 0;
  top: 0;
  bottom: 0;
  width: 2.5rem;

  color: ${props => props.theme.grey.light};
`

export const TextInput = styled.input<{hasIconLeft?: boolean}>`
  font-size: 1rem;
  border-radius: ${props => props.theme.border.radius};
  border: ${props => props.theme.border.width}
    solid ${props => props.theme.grey.light};
  padding: 0.5rem 0.75rem;
  padding-left: ${props => props.hasIconLeft ? '2.5rem' : '0.75rem'}
  width: 100%;

  &:focus + ${Icon} {
    color: ${props => props.theme.grey.dark};
  }
`

export class Input extends React.PureComponent<InputProps> {
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(this.props.name, e.target.value)
    }
  }
  render() {
    return (
      <Field>
        <Label>{this.props.label}</Label>
        <Control>
          <TextInput
            hasIconLeft={!!Icon}
            name={this.props.name}
            type={this.props.type}
            value={this.props.value}
            onChange={this.handleChange}
            placeholder={this.props.placeholder}
            readOnly={!!this.props.readOnly}
            required={this.props.required}
          />
          {this.props.Icon && <Icon><this.props.Icon /></Icon>}
          {this.props.error && (
            <Help colorScheme='danger'>{this.props.error}</Help>
          )}
        </Control>
      </Field>
    )
  }
}
