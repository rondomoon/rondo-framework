import {ICrumbs, TCrumbsAction} from './CrumbsActions'

export interface ICrumbsState extends ICrumbs {
}

const defaultState: ICrumbsState = {
  links: [],
  current: 'Home',
}

export function Crumbs(state = defaultState, action: TCrumbsAction)
  : ICrumbsState {
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
