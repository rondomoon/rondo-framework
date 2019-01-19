import {ILoginState} from './LoginReducer'
import {LoginActions} from './LoginActions'
import {LoginForm} from './LoginForm'
import {bindActionCreators, Dispatch} from 'redux'
import {connect} from 'react-redux'
import {IStateSlicer} from '../redux'

export class LoginConnector<GlobalState> {
  constructor(
    protected readonly loginActions: LoginActions,
    protected readonly slice: IStateSlicer<GlobalState, ILoginState>,
  ) {}

  connect() {
    return connect(
      this.mapStateToProps,
      this.mapDispatchToProps,
    )(LoginForm)
  }

  mapStateToProps = (globalState: GlobalState) => {
    const state = this.slice(globalState)
    return {
      csrfToken: '123',  // TODO this should be read from the state too
      error: state.error,
      user: state.user,
    }
  }

  mapDispatchToProps = (dispatch: Dispatch) => {
    return {
      onSubmit: bindActionCreators(this.loginActions.logIn, dispatch),
    }
  }
}
