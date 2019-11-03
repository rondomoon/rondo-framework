import { DefaultTheme } from 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string
      secondary: string
      warning: string
      danger: string
      info: string
    }
    grey: {
      dark: string
      light: string
      lighter: string
    }
    border: {
      width: string
      radius: string
    }
  }
}

export const theme: DefaultTheme = {
  colors: {
    primary: 'indigo',
    secondary: 'green',
    warning: 'yellow',
    danger: 'red',
    info: 'lightblue',
  },
  grey: {
    dark: 'darkgrey',
    light: 'lightgrey',
    lighter: 'whitesmoke',
  },
  border: {
    width: '1px',
    radius: '3px',
  },
}

export type ColorScheme =
  'primary' | 'secondary' | 'warning' | 'danger' | 'info'
