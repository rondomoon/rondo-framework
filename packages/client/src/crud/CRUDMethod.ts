export type CRUDAsyncMethod =
  'save'
  | 'update'
  | 'findOne'
  | 'findMany'
  | 'remove'

export type CRUDSyncMethod =
  | 'create'
  | 'edit'
  | 'change'

export type CRUDMethod =
  CRUDAsyncMethod
  | CRUDSyncMethod
