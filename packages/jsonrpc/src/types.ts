type ArgumentTypes<T> =
  T extends (...args: infer U) => infer R ? U : never
type RetType<T> = T extends (...args: any[]) => infer R ? R : never
type UnwrapHOC<T> = T extends (...args: any[]) => infer R ? R : T
type RetProm<T> = T extends Promise<any> ? T : Promise<T>
type PromisifyReturnType<T> = (...a: ArgumentTypes<T>) =>
  RetProm<UnwrapHOC<RetType<T>>>

export type TAsyncified<T> = {
  [K in keyof T]: PromisifyReturnType<T[K]>
}

export type TReduxed<T, ActionType extends string> = {
  [K in keyof T]: (...a: ArgumentTypes<T[K]>) => {
    type: ActionType
    payload: RetProm<UnwrapHOC<RetType<T[K]>>>
    method: K
    status: 'pending'
  }
}
