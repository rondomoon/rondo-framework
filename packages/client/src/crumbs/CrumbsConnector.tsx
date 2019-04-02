import {Crumb} from './Crumb'
import {Connector, TStateSelector} from '../redux'
import {ICrumbsState} from './CrumbsReducer'
import {CrumbsActions} from './CrumbsActions'

export class CrumbsConnector extends Connector<ICrumbsState> {
  protected readonly breadcrumbsActions = new CrumbsActions()

  connect<State>(getLocalState: TStateSelector<State, ICrumbsState>) {
    return this.wrap(
      getLocalState,
      state => state,
      dispatch => ({}),
      Crumb,
    )
  }
}
