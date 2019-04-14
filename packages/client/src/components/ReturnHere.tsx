import React, {useEffect} from 'react'
import {Dispatch, bindActionCreators} from 'redux'
import {IWithRouterProps} from './IWithRouterProps'
import {connect} from 'react-redux'
import {setRedirectTo} from '../login/LoginActions'
import {withRouter} from 'react-router'

export interface IReturnToProps extends IWithRouterProps {
  setRedirectTo: typeof setRedirectTo
}

function FReturnHere(props: IReturnToProps) {
  const {
    // tslint:disable-next-line
    setRedirectTo,
    history,
    location,
    match,
    ...otherProps
  } = props

  useEffect(() => {
    setRedirectTo(match.url)
  })

  return null
}

export const ReturnHere = withRouter(connect(
  () => ({
    // no props
  }),
  (dispatch: Dispatch) => ({
    setRedirectTo: bindActionCreators(setRedirectTo, dispatch),
  }),
)(FReturnHere))
