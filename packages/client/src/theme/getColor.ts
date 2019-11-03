import { ColorSchemeProps } from './ColorSchemeProps'

export function getColor(props: ColorSchemeProps) {
  return props.theme.colors[props.colorScheme || 'primary']
}

export function getBorder(props: ColorSchemeProps) {
  return `${props.theme.border.width} solid ${getColor(props)};`
}
