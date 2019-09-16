import { pack, SelectState } from '@rondo.dev/redux'
import { Crumb } from './Crumb'
import { CrumbsState } from './CrumbsState'

export function configureCrumbs<State>(
  getLocalState: SelectState<State, CrumbsState>,
) {
  return pack(
    getLocalState,
    state => state,
    dispatch => ({}),
    Crumb,
  )
}
