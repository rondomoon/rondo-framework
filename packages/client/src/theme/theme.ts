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
    }
    border: {
      width: 1
      radius: 3
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
  },
  border: {
    width: 1,
    radius: 3,
  },
}

export type ColorScheme =
  'primary' | 'secondary' | 'warning' | 'danger' | 'info'
