/*
 * Select and return a part of the state
 */
export type IStateSelector<GlobalState, StateSlice>
  = (state: GlobalState) => StateSlice
