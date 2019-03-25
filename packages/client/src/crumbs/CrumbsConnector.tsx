import {Crumb} from './Crumb'
import {Connector, IStateSelector} from '../redux'
import {ICrumbsState} from './CrumbsReducer'
import {CrumbsActions} from './CrumbsActions'

export class CrumbsConnector extends Connector<ICrumbsState> {
  protected readonly breadcrumbsActions = new CrumbsActions()

  connect<State>(getLocalState: IStateSelector<State, ICrumbsState>) {
    return this.wrap(
      getLocalState,
      state => state,
      dispatch => ({}),
      Crumb,
    )
  }
}
