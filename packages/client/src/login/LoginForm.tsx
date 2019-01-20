import React from 'react'
import {Input} from '../components/Input'
import {ICredentials} from '@rondo/common'

export interface ILoginFormProps {
  error?: string
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
  handleChange = (name: string, value: string) => {
    this.setState(
      {[name]: value} as Pick<ILoginFormState, keyof ILoginFormState>,
    )
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Input
          name='username'
          type='text'
          onChange={this.handleChange}
          value={this.state.username}
        />
        <Input
          name='password'
          type='password'
          onChange={this.handleChange}
          value={this.state.password}
        />
        <Input
          name='submit'
          type='submit'
          value='Log In'
        />
      </form>
    )
  }
}
