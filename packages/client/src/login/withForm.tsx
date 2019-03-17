import React from 'react'

export interface IComponentProps<Data> {
  onSubmit: () => void
  onChange: (name: string, value: string) => void
  // TODO clear data on successful submission. This is important to prevent
  // passwords being accidentally rendered in the background.
  data: Data
}

export interface IFormHOCProps<Data> {
  onSubmit: (props: Data) => Promise<void>
  // TODO figure out what would happen if the underlying child component
  // would have the same required property as the HOC, like onSuccess?
  onSuccess?: () => void
}

export function withForm<Data, Props extends IComponentProps<Data>>(
  Component: React.ComponentType<Props>,
  initialState: Data,
) {

  type OtherProps = Pick<Props,
    Exclude<keyof Props, keyof IComponentProps<Data>>>
  type T = IFormHOCProps<Data> & OtherProps

  return class FormHOC extends React.PureComponent<T, Data> {
    constructor(props: T) {
      super(props)
      this.state = initialState
    }
    handleSubmit = async (e: React.FormEvent) => {
      const {onSuccess} = this.props
      e.preventDefault()
      await this.props.onSubmit(this.state)
      if (onSuccess) {
        onSuccess()
      }
    }
    handleChange = (name: string, value: string) => {
      this.setState(
        {[name]: value} as unknown as Pick<Data, keyof Data>,
      )
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
