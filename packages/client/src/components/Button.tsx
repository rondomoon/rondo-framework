import React from 'react'

export interface IButtonProps {
  type: string
}

export class Button extends React.PureComponent {
  render() {
    return (
      <button>{this.props.children}</button>
    )
  }
}
