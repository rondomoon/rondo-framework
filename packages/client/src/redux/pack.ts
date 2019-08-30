import { ComponentType, PureComponent } from 'react'
import { connect, Omit } from 'react-redux'
import { Dispatch } from 'redux'
import { TStateSelector } from './TStateSelector'

/**
 * This function can be used to pack React components into reusable modules.
 *
 * For example:
 *
 *
 *     function configure(
 *        actions: Actions,
 *        getLocalState: (state: State) => LocalState,
 *     ) {
 *       pack(
 *         getLocalState,
 *         function mapStateToProps(localState: LocalState) {
 *           return localState,
 *         },
 *         function mapDispatchToProps(dispatch: Dispatch) {
 *           return bindActionCreators(actions, dispatch)
 *         },
 *         Component
 *       )
 *     }
 */
export function pack<
    LocalState,
    State,
    Props,
    StateProps extends Partial<Props>,
    DispatchProps extends Partial<Props>,
>(
  getLocalState: TStateSelector<State, LocalState>,
  mapStateToProps: (state: LocalState) => StateProps,
  mapDispatchToProps: (dispatch: Dispatch) => DispatchProps,
  Component: React.ComponentType<Props>,
): ComponentType<
  Omit<Props, keyof Props & (keyof StateProps | keyof DispatchProps)>
> {

  return connect(
    (state: State) => {
      const l = getLocalState(state)
      return mapStateToProps(l)
    },
    mapDispatchToProps,
  )(Component as any) as any
}
