import styled from 'styled-components'

export function cond(check: boolean | undefined, style: string) {
  return cond ? style + ';' : ''
}

export interface FlexProps {
  hcenter?: boolean
  vcenter?: boolean
}

export const Flex = styled.div<FlexProps>`
  display: flex;
  ${props => cond(props.hcenter, 'justify-content: center')}
  ${props => cond(props.vcenter, 'align-items: center')}
`

Flex.defaultProps = {
  hcenter: true,
  vcenter: true,
}
