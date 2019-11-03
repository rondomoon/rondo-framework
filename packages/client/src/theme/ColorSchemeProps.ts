import { DefaultTheme, ThemeProps } from 'styled-components'
import { ColorScheme } from './theme'

export interface ColorSchemeProps extends ThemeProps<DefaultTheme> {
  colorScheme?: ColorScheme
}
