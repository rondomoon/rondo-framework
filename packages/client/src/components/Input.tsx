import React from 'react'

export interface IInputProps {
  name: string
  type: 'text' | 'password' | 'hidden' | 'submit' | 'email'
  value?: string
  onChange?: (name: this['name'], value: string) => void
  placeholder?: string
  readOnly?: boolean
}

export class Input extends React.PureComponent<IInputProps> {
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(this.props.name, e.target.value)
    }
  }
  render() {
    return (
      <input
        name={this.props.name}
        type={this.props.type}
        value={this.props.value}
        onChange={this.handleChange}
        placeholder={this.props.placeholder}
        readOnly={!!this.props.readOnly}
      />
    )
  }
}
