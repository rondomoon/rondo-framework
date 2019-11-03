import styled from 'styled-components'
import { getColor, ColorSchemeProps, getBorder } from '../theme'

export const Button = styled.button<ColorSchemeProps>`
  padding: 0.5rem;
  background: transparent;
  color: ${getColor};
  border: ${getBorder};
  border-radius: ${props => props.theme.border.radius}px;
  cursor: pointer;

  &:hover {
    background: ${getColor};
    color: white;
  }

  &:hover:active {
    box-shadow: 0 0 3px ${getColor};
  }
`
