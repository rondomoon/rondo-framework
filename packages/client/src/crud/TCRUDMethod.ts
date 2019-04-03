export type TCRUDAsyncMethod =
  'save'
  | 'update'
  | 'findOne'
  | 'findMany'
  | 'remove'

export type TCRUDSyncMethod =
  | 'create'
  | 'edit'
  | 'change'

export type TCRUDMethod =
  TCRUDAsyncMethod
  | TCRUDSyncMethod
