import {UserActions} from '../actions/UserActions'
import {connect} from 'react-redux'
import {bindActionCreators, Dispatch} from 'redux'
import {IState} from '../reducers'
// import {LoginForm} from '../components/LoginForm'
import React from 'react'

export class LoginFormContainer {
  constructor(
    protected readonly Form: typeof React.PureComponent | typeof React.Component,
    protected readonly userActions: UserActions,  // TODO interface
  ) {}

  connect() {
    return connect(this.mapStateToProps, this.mapDispatchToProps)()
  }

  mapStateToProps = (state: IState) => {
    return {
      csrfToken: '',  // TODO this should be read from the state too
      error: state.user.error,
      user: state.user.user,
    }
  }

  mapDispatchToProps = (dispatch: Dispatch) => {
    return {
      logIn: bindActionCreators(this.userActions.logIn, dispatch),
    }
  }
}
