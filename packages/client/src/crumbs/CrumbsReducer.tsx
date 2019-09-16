import { CrumbsAction } from './CrumbsActions'
import { CrumbsState } from './CrumbsState'

const defaultState: CrumbsState = {
  links: [],
  current: 'Home',
}

export function Crumbs(
  state = defaultState,
  action: CrumbsAction,
): CrumbsState {
  switch (action.type) {
    case 'BREADCRUMBS_SET':
      return {
        links: action.payload.links,
        current: action.payload.current,
      }
    default:
      return state
  }
}
