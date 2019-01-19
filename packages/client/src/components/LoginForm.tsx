import React from 'react'
import {Input} from './Input'
import {ICredentials} from '@rondo/common'
import {IState} from '../reducers'

export interface ILoginFormProps {
  error?: string
  csrfToken: string
  onSubmit: (credentials: ICredentials) => void
}

export interface ILoginFormState extends ICredentials {}

// TODO maybe replace this with Formik, which is recommended in React docs
// https://jaredpalmer.com/formik/docs/overview
export class LoginForm extends React.PureComponent<
  ILoginFormProps, ILoginFormState
> {
  constructor(props: ILoginFormProps) {
    super(props)
    this.state = {
      username: '',
      password: '',
    }
  }
  handleSubmit = () => {
    this.props.onSubmit(this.state)
  }
  handleChange = (name: keyof ILoginFormState, value: string) => {
    this.setState(
      {[name]: value} as Pick<ILoginFormState, keyof ILoginFormState>,
    )
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Input
          type='hidden'
          name='_csrf'
          value={this.props.csrfToken}
        />
        <Input
          name='username'
          type='text'
          value={this.state.username}
        />
        <Input
          name='password'
          type='password'
          value={this.state.password}
        />
      </form>
    )
  }
}
