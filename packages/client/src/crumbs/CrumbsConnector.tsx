import { TStateSelector } from '@rondo.dev/redux'
import { Connector } from '../redux'
import { Crumb } from './Crumb'
import { CrumbsActions } from './CrumbsActions'
import { ICrumbsState } from './CrumbsReducer'

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
