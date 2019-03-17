import {Connector} from '../redux/Connector'
import {ICredentials} from '@rondo/common'
import {ILoginState} from './LoginReducer'
import {IStateSelector} from '../redux'
import {LoginActions} from './LoginActions'
import {LoginForm} from './LoginForm'
import {bindActionCreators} from 'redux'
import {withForm} from './withForm'

const defaultCredentials: ICredentials = {
  username: '',
  password: '',
}

export class LoginConnector extends Connector {

  constructor(protected readonly loginActions: LoginActions) {
    super()
  }

  connect<State>(getLocalState: IStateSelector<State, ILoginState>) {
    return this.wrap(
      getLocalState,
      state => ({
        error: state.error,
        user: state.user,
      }),
      dispatch => ({
        onSubmit: bindActionCreators(this.loginActions.logIn, dispatch),
        clearOnSuccess: true,
      }),
      withForm(LoginForm, defaultCredentials),
    )
  }
}
