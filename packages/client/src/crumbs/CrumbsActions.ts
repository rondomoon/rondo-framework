import {GetAllActions, Action} from '@rondo.dev/redux'
import {CrumbLink} from './CrumbLink'

export interface Crumbs {
  links: CrumbLink[]
  current: string
}

export type CrumbsAction = GetAllActions<CrumbsActions>

export class CrumbsActions {
  setCrumbs(breadcrumbs: Crumbs): Action<Crumbs, 'BREADCRUMBS_SET'> {
    return {
      payload: breadcrumbs,
      type: 'BREADCRUMBS_SET',
    }
  }
}
