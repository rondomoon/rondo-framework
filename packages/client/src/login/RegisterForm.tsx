import React from 'react'
import {ICredentials} from '@rondo/common'
import {Input} from '../components/Input'

export interface IRegisterFormProps {
  error?: string
  onSubmit: () => void
  onChange: (name: string, value: string) => void
  data: ICredentials
}

export class RegisterForm extends React.PureComponent<IRegisterFormProps> {
  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        <p className='error'>{this.props.error}</p>
        <Input
          name='username'
          type='email'
          onChange={this.props.onChange}
          value={this.props.data.username}
          placeholder='Email'
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
          value='Register'
        />
      </form>
    )
  }
}
