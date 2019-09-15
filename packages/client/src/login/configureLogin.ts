import { Credentials } from '@rondo.dev/common'
import { pack, TStateSelector } from '@rondo.dev/redux'
import { bindActionCreators } from 'redux'
import { LoginActions } from './LoginActions'
import { LoginForm } from './LoginForm'
import { ILoginState } from './LoginReducer'
import { withForm } from './withForm'

const defaultCredentials: Credentials = {
  username: '',
  password: '',
}

export function configureLogin<State>(
  getLocalState: TStateSelector<State, ILoginState>,
  loginActions: LoginActions,
) {
  return pack(
    getLocalState,
    state => ({
      error: state.error,
      user: state.user,
      redirectTo: state.redirectTo,
    }),
    dispatch => ({
      onSubmit: bindActionCreators(loginActions.logIn, dispatch),
      clearOnSuccess: true,
    }),
    withForm(LoginForm, defaultCredentials),
  )
}
