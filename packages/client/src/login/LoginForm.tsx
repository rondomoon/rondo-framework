import React from 'react'
import {ICredentials, IUser} from '@rondo/common'
import {Input} from '../components/Input'
import {Redirect} from '../components/Redirect'
import {FaUser, FaLock} from 'react-icons/fa'

export interface ILoginFormProps {
  error?: string
  onSubmit: () => void
  onChange: (name: string, value: string) => void
  data: ICredentials
  user?: IUser
  redirectTo: string
}

// TODO maybe replace this with Formik, which is recommended in React docs
// https://jaredpalmer.com/formik/docs/overview
export class LoginForm extends React.PureComponent<ILoginFormProps> {
  render() {
    if (this.props.user) {
      return <Redirect to={this.props.redirectTo} />
    }
    return (
      <form onSubmit={this.props.onSubmit}>
        <p className='error'>{this.props.error}</p>
        <Input
          Icon={FaUser}
          label='Username'
          name='username'
          type='text'
          onChange={this.props.onChange}
          value={this.props.data.username}
          placeholder='Username'
        />
        <Input
          Icon={FaLock}
          label='Password'
          name='password'
          type='password'
          onChange={this.props.onChange}
          value={this.props.data.password}
          placeholder='Password'
        />
        <input
          className='button is-primary'
          name='submit'
          type='submit'
          value='Log In'
        />
      </form>
    )
  }
}
