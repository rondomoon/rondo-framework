import React from 'react'
import { Link } from 'react-router-dom'
import { CrumbLink } from './CrumbLink'
import styled from 'styled-components'

const Breadcrumb = styled.ul`
  list-style: none;
  padding: 0;
`

const BreadcrumbItem = styled.li`
  display: inline-block;
  padding: 1rem 0.5rem 1rem 0;

  & + &:before {
    padding-right: 0.5rem;
    color: ${props => props.theme.grey.light};
    content: '»';
  }
`

export interface CrumbProps {
  links: CrumbLink[]
  current: string
}

export class Crumb extends React.PureComponent<CrumbProps> {
  render() {
    return (
      <Breadcrumb>
        <ul>
          <BreadcrumbItem>
            <Link to='/'>Home</Link>
          </BreadcrumbItem>
          {this.props.links.map((link, i) => (
            <BreadcrumbItem key={i}>
              <Link to={link.to}>{link.name}</Link>
            </BreadcrumbItem>
          ))}
          <BreadcrumbItem>
            <span>{this.props.current}</span>
          </BreadcrumbItem>
        </ul>
      </Breadcrumb>
    )
  }
}
