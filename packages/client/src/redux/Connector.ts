import {IStateSelector} from './IStateSelector'
import {connect, Omit} from 'react-redux'
import {Dispatch} from 'redux'
import {ComponentType} from 'react'

// https://stackoverflow.com/questions/54277411
export abstract class Connector {

  abstract connect<State, LocalState>(
    getLocalState: IStateSelector<State, LocalState>,
  ): ComponentType<any>

  protected wrap<
    State,
    LocalState,
    StateProps,
    DispatchProps,
    Props
  >(
    getLocalState: IStateSelector<State, LocalState>,
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
}
