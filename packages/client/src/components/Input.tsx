import React from 'react'

export interface IInputProps {
  name: string
  type: 'text' | 'password' | 'hidden'
  value?: string
  onChange?: (name: string, value: string) => void
}

export class Input extends React.PureComponent<IInputProps> {
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(e.target.name, e.target.value)
    }
  }
  render() {
    return (
      <input
        name={this.props.name}
        type={this.props.type}
        value={this.props.value}
      />
    )
  }
}
