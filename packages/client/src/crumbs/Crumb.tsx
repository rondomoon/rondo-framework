import React from 'react'
import {Breadcrumb, BreadcrumbItem} from 'bloomer'
import {Link} from 'react-router-dom'
import {ICrumbLink} from './ICrumbLink'

export interface ICrumbProps {
  links: ICrumbLink[]
  current: string
}

export class Crumb extends React.PureComponent<ICrumbProps> {
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
