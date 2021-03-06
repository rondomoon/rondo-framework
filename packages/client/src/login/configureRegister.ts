import { NewUser } from '@rondo.dev/common'
import { pack, SelectState } from '@rondo.dev/redux'
import { bindActionCreators } from 'redux'
import { LoginActions } from './LoginActions'
import { LoginState } from './LoginReducer'
import { RegisterForm } from './RegisterForm'
import { withForm } from './withForm'

const defaultCredentials: NewUser & { captcha: string }= {
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  captcha: '',
}

export function configureRegister<State>(
  getLocalState: SelectState<State, LoginState>,
  loginActions: LoginActions,
  baseUrl: string,
) {
  return pack(
    getLocalState,
    state => ({
      error: state.error,
      user: state.user,
      redirectTo: state.redirectTo,
    }),
    dispatch => ({
      baseUrl,
      onSubmit: bindActionCreators(loginActions.register, dispatch),
      clearOnSuccess: true,
    }),
    withForm(RegisterForm, defaultCredentials),
  )
}
