import {Connector} from '../redux/Connector'
import {ICredentials} from '@rondo/common'
import {ILoginState} from './LoginReducer'
import {IStateSelector} from '../redux'
import {LoginActions} from './LoginActions'
import {RegisterForm} from './RegisterForm'
import {bindActionCreators} from 'redux'
import {withForm} from './withForm'

const defaultCredentials: ICredentials = {
  username: '',
  password: '',
}

export class RegisterConnector extends Connector {

  constructor(protected readonly loginActions: LoginActions) {
    super()
  }

  connect<State>(getLocalState: IStateSelector<State, ILoginState>) {
    return this.wrap(
      getLocalState,
      state => ({
        error: state.error,
      }),
      dispatch => ({
        onSubmit: bindActionCreators(this.loginActions.register, dispatch),
      }),
      withForm(RegisterForm, defaultCredentials),
    )
  }
}
