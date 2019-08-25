import React from 'react'
import {FaUser, FaLock} from 'react-icons/fa'
import {ICredentials, IUser} from '@rondo.dev/common'
import {Input} from '../components/Input'
import {Link} from 'react-router-dom'
import {Redirect} from '../components/Redirect'

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
          <input
            className='button is-primary'
            name='submit'
            type='submit'
            value='Log In'
          />
        </div>

        <p className='small center mt-1'>
          Don&apos;t have an account? <Link to='/auth/register'>Sign up!</Link>
        </p>
      </form>
    )
  }
}
