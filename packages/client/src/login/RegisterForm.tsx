import React from 'react'
import {FaEnvelope, FaUser, FaLock} from 'react-icons/fa'
import {INewUser, IUser} from '@rondo/common'
import {Input} from '../components/Input'
import {Link} from 'react-router-dom'
import {Redirect} from '../components/Redirect'

export interface IRegisterFormProps {
  error?: string
  onSubmit: () => void
  onChange: (name: string, value: string) => void
  data: INewUser
  user?: IUser
  redirectTo: string
}

export class RegisterForm extends React.PureComponent<IRegisterFormProps> {
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
        <p className='has-text-danger'>{this.props.error}</p>
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
