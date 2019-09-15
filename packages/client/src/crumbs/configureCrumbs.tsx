import { pack, TStateSelector } from '@rondo.dev/redux'
import { Crumb } from './Crumb'
import { ICrumbsState } from './CrumbsReducer'

export function configureCrumbs<State>(
  getLocalState: TStateSelector<State, ICrumbsState>,
) {
  return pack(
    getLocalState,
    state => state,
    dispatch => ({}),
    Crumb,
  )
}
