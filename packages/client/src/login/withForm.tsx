import React from 'react'
import {IPendingAction} from '@rondo.dev/redux'

export interface IComponentProps<Data> {
  onSubmit: () => void
  onChange: (name: string, value: string) => void
  // TODO clear data on successful submission. This is important to prevent
  // passwords being accidentally rendered in the background.
  data: Data
}

export interface IFormHOCProps<Data> {
  onSubmit: (props: Data) => IPendingAction<any, any>
  // TODO figure out what would happen if the underlying child component
  // would have the same required property as the HOC, like onSuccess?
  onSuccess?: () => void
  clearOnSuccess?: boolean
}

export interface IFormHOCState<Data> {
  error: string
  data: Data
}

export function withForm<Data, Props extends IComponentProps<Data>>(
  Component: React.ComponentType<Props>,
  initialState: Data,
) {

  type OtherProps = Pick<Props,
    Exclude<keyof Props, keyof IComponentProps<Data>>>
  type T = IFormHOCProps<Data> & OtherProps

  return class FormHOC extends React.PureComponent<T, IFormHOCState<Data>> {
    constructor(props: T) {
      super(props)
      this.state = {
        error: '',
        data: initialState,
      }
    }
    handleSubmit = async (e: React.FormEvent) => {
      const {clearOnSuccess, onSuccess} = this.props
      e.preventDefault()
      const action = this.props.onSubmit(this.state.data)
      try {
        await action.payload
      } catch (err) {
        this.setState({
          error: err.message,
        })
        return
      }
      if (clearOnSuccess) {
        this.setState({
          ...this.state,
          data: initialState,
        })
      }
      if (onSuccess) {
        onSuccess()
      }
    }
    handleChange = (name: string, value: string) => {
      this.setState({
        ...this.state,
        data: {
          ...this.state.data,
          [name]: value,
        },
      })
    }
    render() {
      const {children, onSuccess, onSubmit, ...otherProps} = this.props

      // Casting otherProps to any because type inference does not work when
      // combinig OtherProps and ChildProps back to Component:
      // https://github.com/Microsoft/TypeScript/issues/28938
      return (
        <Component
          {...otherProps as any}
          data={this.state}
          onSubmit={this.handleSubmit}
          onChange={this.handleChange}
        />
      )
    }
  }
}
