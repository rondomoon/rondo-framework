export type ArgumentTypes<T> =
  T extends (...args: infer U) => infer R ? U : never
export type RetType<T> = T extends (...args: any[]) => infer R ? R : never
export type UnwrapHOC<T> = T extends (...args: any[]) => infer R ? R : T
export type RetProm<T> = T extends Promise<any> ? T : Promise<T>
export type PromisifyReturnType<T> = (...a: ArgumentTypes<T>) =>
  RetProm<UnwrapHOC<RetType<T>>>
export type Asyncified<T> = {
  [K in keyof T]: PromisifyReturnType<T[K]>
}

export type Reduxed<T, ActionType extends string> = {
  [K in keyof T]: (...a: ArgumentTypes<T[K]>) => {
    type: ActionType
    payload: RetProm<UnwrapHOC<RetType<T[K]>>>
    method: K
    status: 'pending'
  }
}
