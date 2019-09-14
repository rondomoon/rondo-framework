import { INewUser } from '@rondo.dev/common'
import { pack, TStateSelector } from '@rondo.dev/redux'
import { bindActionCreators } from 'redux'
import { LoginActions } from './LoginActions'
import { ILoginState } from './LoginReducer'
import { RegisterForm } from './RegisterForm'
import { withForm } from './withForm'

const defaultCredentials: INewUser = {
  username: '',
  password: '',
  firstName: '',
  lastName: '',
}

export function configureRegister<State>(
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
      onSubmit: bindActionCreators(loginActions.register, dispatch),
      clearOnSuccess: true,
    }),
    withForm(RegisterForm, defaultCredentials),
  )
}
