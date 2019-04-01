import {GetAction, IAction} from '../actions'

export interface ICrumbLink {
  name: string
  to: string
}

export interface ICrumbs {
  links: ICrumbLink[]
  current: string
}

export type CrumbsActionType =
  IAction<ICrumbs, 'BREADCRUMBS_SET'>

type Action<T extends string> = GetAction<CrumbsActionType, T>

export class CrumbsActions {
  setCrumbs(breadcrumbs: ICrumbs): Action<'BREADCRUMBS_SET'> {
    return {
      payload: breadcrumbs,
      type: 'BREADCRUMBS_SET',
    }
  }
}
