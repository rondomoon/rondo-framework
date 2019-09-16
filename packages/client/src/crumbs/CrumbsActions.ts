import { Action, GetAllActions } from '@rondo.dev/redux'
import { CrumbsState } from './CrumbsState'

export type CrumbsAction = GetAllActions<CrumbsActions>

export class CrumbsActions {
  setCrumbs(breadcrumbs: CrumbsState): Action<CrumbsState, 'BREADCRUMBS_SET'> {
    return {
      payload: breadcrumbs,
      type: 'BREADCRUMBS_SET',
    }
  }
}
