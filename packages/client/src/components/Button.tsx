import React from 'react'

export interface ButtonProps {
  // type: string
}

export class Button extends React.PureComponent<ButtonProps> {
  render() {
    return (
      <button>{this.props.children}</button>
    )
  }
}
