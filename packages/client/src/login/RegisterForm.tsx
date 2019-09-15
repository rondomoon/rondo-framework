import { NewUser, UserProfile } from '@rondo.dev/common'
import React from 'react'
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Input } from '../components/Input'
import { Redirect } from '../components/Redirect'

export interface RegisterFormProps {
  error?: string
  onSubmit: () => void
  onChange: (name: string, value: string) => void
  data: NewUser
  user?: UserProfile
  redirectTo: string
}

export class RegisterForm extends React.PureComponent<RegisterFormProps> {
  render() {
    if (this.props.user) {
      return <Redirect to={this.props.redirectTo} />
    }
    return (
      <form
        autoComplete='off'
        className='register-form'
        onSubmit={this.props.onSubmit}
      >
        <p className='error has-text-danger'>{this.props.error}</p>
        <Input
          Icon={FaEnvelope}
          label='Email'
          name='username'
          type='email'
          onChange={this.props.onChange}
          value={this.props.data.username}
          placeholder='Email'
          required
        />
        <Input
          Icon={FaLock}
          label='Password'
          name='password'
          type='password'
          onChange={this.props.onChange}
          value={this.props.data.password}
          placeholder='Password'
          required
        />
        <Input
          Icon={FaUser}
          label='First Name'
          name='firstName'
          type='text'
          onChange={this.props.onChange}
          value={this.props.data.firstName}
          placeholder='First name'
          required
        />
        <Input
          Icon={FaUser}
          label='Last Name'
          name='lastName'
          type='text'
          onChange={this.props.onChange}
          value={this.props.data.lastName}
          placeholder='Last name'
          required
        />
        <div className='text-center'>
          <input
            className='button is-primary'
            name='submit'
            type='submit'
            value='Register'
          />
        </div>
        <p className='small center mt-1'>
          Already have an account? <Link to='/auth/login'>Log in!</Link>
        </p>
      </form>
    )
  }
}
