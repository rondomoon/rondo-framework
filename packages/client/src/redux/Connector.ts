import {TStateSelector} from './TStateSelector'
import {connect, Omit} from 'react-redux'
import {Dispatch} from 'redux'
import {ComponentType} from 'react'

/**
 * Helps isolate the component along with actions and reducer from the global
 * application state.
 *
 * The connect() function requires a state selector, which can be used to
 * select a slice of the current state to the component, which will be passed
 * on to `mapStateToProps()`.
 *
 * Classes that extend Connector can provide dependencies in the constructor
 * and then bind them to dispatch in mapDispatchToProps. This is useful to
 * build components which do not depend on a "global" singletons. For example,
 * the Actions class might depend on the HTTPClient class, and then it becomes
 * easy to mock it during tests, or swap out different dependencies for
 * different applications.
 */
export abstract class Connector<LocalState> {

  /**
   * Connects a component using redux. The `selectState` method is used to
   * select a subset of state to map to the component.
   *
   * It returns a component with `any` props. Ideally this could be changed to
   * required props.
   *
   * https://stackoverflow.com/questions/54277411
   */
  abstract connect<State>(
    selectState: TStateSelector<State, LocalState>,
  ): ComponentType<any>

  protected wrap<
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
}
