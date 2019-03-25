import React from 'react'
import {Breadcrumb, BreadcrumbItem} from 'bloomer'
import {Link} from 'react-router-dom'

export interface IBreadcrumbsProps {
  links: Array<{
    name: string
    to: string
  }>
  current: string
}

export class Breadcrumbs extends React.PureComponent<IBreadcrumbsProps> {
  render() {
    return (
      <Breadcrumb>
        <ul>
          {this.props.links.map((link, i) => (
            <BreadcrumbItem key={i}>
              <Link to={link.to}>{link.name}</Link>
            </BreadcrumbItem>
          ))}
          <BreadcrumbItem>{this.props.current}</BreadcrumbItem>
        </ul>
      </Breadcrumb>
    )
  }
}
