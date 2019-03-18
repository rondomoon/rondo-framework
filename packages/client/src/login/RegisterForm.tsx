import React from 'react'
import {ICredentials, IUser} from '@rondo/common'
import {Input} from '../components/Input'
import {Redirect} from '../components/Redirect'

export interface IRegisterFormProps {
  error?: string
  onSubmit: () => void
  onChange: (name: string, value: string) => void
  data: ICredentials
  user?: IUser
  redirectTo: string
}

export class RegisterForm extends React.PureComponent<IRegisterFormProps> {
  render() {
    if (this.props.user) {
      return <Redirect to={this.props.redirectTo} />
    }
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
