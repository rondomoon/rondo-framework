import { Credentials, UserProfile } from '@rondo.dev/common'
import React from 'react'
import { FaLock, FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Button, Input, Redirect } from '../components'

export interface LoginFormProps {
  error?: string
  onSubmit: () => void
  onChange: (name: string, value: string) => void
  data: Credentials
  user?: UserProfile
  redirectTo: string
}

// TODO maybe replace this with Formik, which is recommended in React docs
// https://jaredpalmer.com/formik/docs/overview
export class LoginForm extends React.PureComponent<LoginFormProps> {
  render() {
    if (this.props.user) {
      return <Redirect to={this.props.redirectTo} />
    }
    return (
      <form className='login-form' onSubmit={this.props.onSubmit}>
        <p className='error has-text-danger'>{this.props.error}</p>
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

        <div className='center'>
          <Button type='submit'>
            Log In
          </Button>
        </div>

        <p>
          Don&apos;t have an account? <Link to='/auth/register'>Sign up!</Link>
        </p>
      </form>
    )
  }
}
