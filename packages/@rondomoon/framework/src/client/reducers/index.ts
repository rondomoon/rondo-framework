export interface IState {
  csrfToken: string
  value: string
}

const defaultState: IState = {
  csrfToken: '',
  value: '',
}

export function value(state: IState = defaultState, action: any): IState {
  switch (action && action.type) {
    case 'VALUE_SET':
      return {
        ...state,
        value: action!.payload as string,
      }
    default:
      return state || {value: ''}
  }
}
