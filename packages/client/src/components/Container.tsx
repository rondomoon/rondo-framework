import styled from 'styled-components'

export function keys<O>(o: O) {
  return Object.keys(o) as (keyof O)[]
}

export const Container = styled.div`
  margin: 0 auto;
  padding: 0 1rem;

  ${props => keys(props.theme.screen.min)
    .map(key => `@media(min-width: ${props.theme.screen.min[key]}) {
      max-width: ${props.theme.container[key]};
    }`)
    .join('\n')
  }
`

export const Columns = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: -1rem -1rem -1rem -1rem;
  align-items: center;
`

export type GridSize = number
export const gridSize = 12

export interface ColumnProps {
  xs?: GridSize
  sm?: GridSize
  md?: GridSize
  lg?: GridSize

  offsetxs?: GridSize
  offsetsm?: GridSize
  offsetmd?: GridSize
  offsetlg?: GridSize
}

function getPercentage(size: number) {
  return (size * 100 / gridSize) + '%'
}

export type OffsetKey = 'offsetxs' | 'offsetsm' | 'offsetmd' | 'offsetlg'

export const Column = styled.div<ColumnProps>`
  padding: 1rem;

  width: ${props => getPercentage(props.xs!)};

  ${props => keys(props.theme.screen.min)
    .filter(key => !!props[key])
    .map(key => {
      const offsetKey = 'offset' + key  as OffsetKey
      const offset = props[offsetKey] || 0
      return `@media(min-width: ${props.theme.screen.min[key]}) {
        width: ${getPercentage(props[key]!)};
        margin-left: ${getPercentage(offset)};
      }`
    })
    .join('\n')
  }
`
Column.defaultProps = {
  xs: gridSize,
}
