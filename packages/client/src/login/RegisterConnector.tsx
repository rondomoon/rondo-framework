import {Connector} from '../redux/Connector'
import {INewUser} from '@rondo/common'
import {ILoginState} from './LoginReducer'
import {IStateSelector} from '../redux'
import {LoginActions} from './LoginActions'
import {RegisterForm} from './RegisterForm'
import {bindActionCreators} from 'redux'
import {withForm} from './withForm'

const defaultCredentials: INewUser = {
  username: '',
  password: '',
  firstName: '',
  lastName: '',
}

export class RegisterConnector extends Connector<ILoginState> {

  constructor(protected readonly loginActions: LoginActions) {
    super()
  }

  connect<State>(getLocalState: IStateSelector<State, ILoginState>) {
    return this.wrap(
      getLocalState,
      state => ({
        error: state.error,
        user: state.user,
        redirectTo: state.redirectTo,
      }),
      dispatch => ({
        onSubmit: bindActionCreators(this.loginActions.register, dispatch),
        clearOnSuccess: true,
      }),
      withForm(RegisterForm, defaultCredentials),
    )
  }
}
