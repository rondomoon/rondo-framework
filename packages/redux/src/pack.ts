import { ComponentType, PureComponent } from 'react'
import { connect, Omit, MapDispatchToPropsParam, Matching, GetProps, ResolveThunks } from 'react-redux'
import { Dispatch } from 'redux'

/*
 * Select and return a part of the state
 */
export type TStateSelector<GlobalState, StateSlice>
  = (state: GlobalState) => StateSlice

/**
 * This function can be used to pack React components into reusable modules.
 *
 * For example:
 *
 *
 *     function configure<State>(
 *        actions: Actions,
 *        getLocalState: (state: State) => LocalState,
 *     ) {
 *       return pack(
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
    StateProps,
    DispatchProps,
    C extends React.ComponentType<
      Matching<StateProps & ResolveThunks<DispatchProps>, GetProps<C>>>
>(
  getLocalState: TStateSelector<State, LocalState>,
  mapStateToProps: (state: LocalState) => StateProps,
  mapDispatchToProps: MapDispatchToPropsParam<DispatchProps, Props>,
  Component: C,
) {
  return connect(
    (state: State) => {
      const l = getLocalState(state)
      return mapStateToProps(l)
    },
    mapDispatchToProps,
  )(Component)
}
