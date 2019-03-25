import React from 'react'
import {Breadcrumb, BreadcrumbItem} from 'bloomer'
import {Link} from 'react-router-dom'

export interface ICrumbProps {
  links: Array<{
    name: string
    to: string
  }>
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
            <a>{this.props.current}</a>
          </BreadcrumbItem>
        </ul>
      </Breadcrumb>
    )
  }
}
