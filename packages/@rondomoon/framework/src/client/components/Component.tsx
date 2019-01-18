import React from 'react'
import {connect} from 'react-redux'

interface IComponentProps {
  value: string
}

interface IStateProps {
  value: string
}

export class Component
extends React.PureComponent<IComponentProps, IStateProps> {
  constructor(props: IComponentProps) {
    super(props)
    this.state = {
      value: props.value,
    }
  }
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      value: e.target.value,
    })
  }
  render() {
    return (
      <div>
        <input
          autoComplete='off'
          type='text'
          value={this.state.value}
          onChange={this.handleChange}
        />
        <div>{this.state.value}</div>
      </div>
    )
  }
}

function mapStateToProps(state: any) {
  return {
    value: state.value,
  }
}

export const CComponent = connect(mapStateToProps)(Component)
