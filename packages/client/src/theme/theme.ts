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
    screen: {
      min: {
        sm: string
        md: string
        lg: string
      }
      max: {
        xs: string
        sm: string
        md: string
      }
    }
    container: {
      sm: string
      md: string
      lg: string
    }
  }
}

const screen = {
  sm: 768,
  md: 992,
  lg: 1200,
}

const screenMax = {
  xs: screen.sm - 1,
  sm: screen.md - 1,
  md: screen.lg - 1,
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
  screen: {
    min: {
      sm: screen.sm + 'px',
      md: screen.md + 'px',
      lg: screen.lg + 'px',
    },
    max: {
      xs: screenMax.xs + 'px',
      sm: screenMax.sm + 'px',
      md: screenMax.md + 'px',
    },
  },
  container: {
    sm: '100%',
    md: '960px',
    lg: '1152px',
  },
}

export type ColorScheme =
  'primary' | 'secondary' | 'warning' | 'danger' | 'info'
