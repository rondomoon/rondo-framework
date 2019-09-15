import {useEffect} from 'react'
import {Dispatch, bindActionCreators} from 'redux'
import {WithRouterProps} from './WithRouterProps'
import {connect} from 'react-redux'
import {setRedirectTo} from '../login/LoginActions'
import {withRouter} from 'react-router'

export interface ReturnToProps extends WithRouterProps {
  setRedirectTo: typeof setRedirectTo
}

function FReturnHere(props: ReturnToProps) {
  const {
    setRedirectTo,
    match,
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
