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

export interface ColumnProps {
  xs?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
}

export const Column = styled.div<ColumnProps>`
  padding: 1rem;

  width: ${props => props.xs! * 100 / 12}%;

  ${props => keys(props.theme.screen.min)
    .filter(key => !!props[key])
    .map(key => `@media(min-width: ${props.theme.screen.min[key]}) {
      width: ${props[key]! * 100 / 12}%;
    }`)
    .join('\n')
  }
`
Column.defaultProps = {
  xs: 12,
}
