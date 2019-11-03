import styled from 'styled-components'

export const Panel = styled.div`
  border: ${props => props.theme.border.width}
    solid ${props => props.theme.grey.lighter};
`

export const PanelHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.grey.lighter};
  padding: 1rem;
`

export const PanelBlock = styled.div`
  padding: 1rem;
`
