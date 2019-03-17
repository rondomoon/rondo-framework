import React from 'react'
import {ICredentials} from '@rondo/common'
import {Input} from '../components/Input'

export interface ILoginFormProps {
  error?: string
  onSubmit: () => void
  onChange: (name: string, value: string) => void
  data: ICredentials
}

// TODO maybe replace this with Formik, which is recommended in React docs
// https://jaredpalmer.com/formik/docs/overview
export class LoginForm extends React.PureComponent<ILoginFormProps> {
  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        <p className='error'>{this.props.error}</p>
        <Input
          name='username'
          type='text'
          onChange={this.props.onChange}
          value={this.props.data.username}
          placeholder='Username'
        />
        <Input
          name='password'
          type='password'
          onChange={this.props.onChange}
          value={this.props.data.password}
          placeholder='Password'
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
