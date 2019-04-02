/*
 * Select and return a part of the state
 */
export type TStateSelector<GlobalState, StateSlice>
  = (state: GlobalState) => StateSlice
