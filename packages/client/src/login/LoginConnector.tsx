import {ILoginState} from './LoginReducer'
import {LoginActions} from './LoginActions'
import {LoginForm} from './LoginForm'
import {bindActionCreators} from 'redux'
import {IStateSelector} from '../redux'
import {Connector} from '../redux/Connector'

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
      }),
      LoginForm,
    )
  }
}
