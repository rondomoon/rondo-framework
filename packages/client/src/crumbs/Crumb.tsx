import { Breadcrumb, BreadcrumbItem } from 'bloomer'
import React from 'react'
import { Link } from 'react-router-dom'
import { CrumbLink } from './CrumbLink'

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
