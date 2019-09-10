import { ICredentials } from '@rondo.dev/common'
import { TStateSelector } from '@rondo.dev/redux'
import { bindActionCreators } from 'redux'
import { Connector } from '../redux/Connector'
import { LoginActions } from './LoginActions'
import { LoginForm } from './LoginForm'
import { ILoginState } from './LoginReducer'
import { withForm } from './withForm'

const defaultCredentials: ICredentials = {
  username: '',
  password: '',
}

export class LoginConnector extends Connector<ILoginState> {

  constructor(protected readonly loginActions: LoginActions) {
    super()
  }

  connect<State>(getLocalState: TStateSelector<State, ILoginState>) {
    return this.wrap(
      getLocalState,
      state => ({
        error: state.error,
        user: state.user,
        redirectTo: state.redirectTo,
      }),
      dispatch => ({
        onSubmit: bindActionCreators(this.loginActions.logIn, dispatch),
        clearOnSuccess: true,
      }),
      withForm(LoginForm, defaultCredentials),
    )
  }
}
