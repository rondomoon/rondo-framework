import { NewUser, UserProfile } from '@rondo.dev/common'
import React from 'react'
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { Input } from '../components/Input'
import { Redirect } from '../components/Redirect'
import { Button } from '../components'

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
          Icon={FaUser}
          label='Username'
          name='username'
          type='text'
          onChange={this.props.onChange}
          value={this.props.data.username}
          placeholder='Username'
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
          Icon={FaEnvelope}
          label='Email'
          name='email'
          type='email'
          onChange={this.props.onChange}
          value={this.props.data.username}
          placeholder='Email'
        />
        <Input
          Icon={FaUser}
          label='First Name'
          name='firstName'
          type='text'
          onChange={this.props.onChange}
          value={this.props.data.firstName}
          placeholder='First name'
        />
        <Input
          Icon={FaUser}
          label='Last Name'
          name='lastName'
          type='text'
          onChange={this.props.onChange}
          value={this.props.data.lastName}
          placeholder='Last name'
        />
        <div className='text-center'>
          <Button name='submit' type='submit'>
            Register
          </Button>
        </div>
        <p className='small center mt-1'>
          Already have an account? <Link to='/auth/login'>Log in!</Link>
        </p>
      </form>
    )
  }
}
