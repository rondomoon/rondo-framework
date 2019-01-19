import React from 'react'

export class Button extends React.PureComponent {
  render() {
    return (
      <button>{this.props.children}</button>
    )
  }
}
