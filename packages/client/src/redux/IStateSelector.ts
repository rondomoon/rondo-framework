export type IStateSelector<GlobalState, StateSlice>
  = (state: GlobalState) => StateSlice
