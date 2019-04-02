import {TGetAction, IAction} from '../actions'

export interface ICrumbLink {
  name: string
  to: string
}

export interface ICrumbs {
  links: ICrumbLink[]
  current: string
}

export type TCrumbsAction =
  IAction<ICrumbs, 'BREADCRUMBS_SET'>

type Action<T extends string> = TGetAction<TCrumbsAction, T>

export class CrumbsActions {
  setCrumbs(breadcrumbs: ICrumbs): Action<'BREADCRUMBS_SET'> {
    return {
      payload: breadcrumbs,
      type: 'BREADCRUMBS_SET',
    }
  }
}
