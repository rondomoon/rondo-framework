import React from 'react'
import {Button, Panel, PanelHeading, PanelBlock} from 'bloomer'
import {FaPlus, FaEdit, FaTimes} from 'react-icons/fa'
import {Link} from '../components'

export interface ICRUDListProps<T> {
  nameKey: keyof T
  editLink: (item: T) => string
  itemIds: number[]
  itemsById: Record<number, T>
  newLink: string
  onRemove: (t: T) => void
  title: string
}

export interface ICRUDItemRowProps<T> {
  nameKey: keyof T
  editLink: string
  item: T
  onRemove: (t: T) => void
}

export class CRUDItemRow<T> extends React.PureComponent<ICRUDItemRowProps<T>> {
  handleRemove = () => {
    const {onRemove, item} = this.props
    onRemove(item)
  }
  render() {
    const {nameKey, editLink, item} = this.props

    return (
      <React.Fragment>
        <div className='item-info'>
          {item[nameKey]}
        </div>
        <div className='ml-auto'>
          <Link to={editLink}>
            <Button isInverted isColor='link' aria-label='Edit'>
              <FaEdit />
            </Button>
          </Link>
          &nbsp;
          <Button
            aria-label='Remove'
            onClick={this.handleRemove}
            isColor='danger'
            isInverted
          >
            <FaTimes />
          </Button>
        </div>
      </React.Fragment>
    )
  }
}

export class CRUDList<T> extends React.PureComponent<ICRUDListProps<T>> {
  render() {
    const {nameKey, editLink, itemIds, itemsById, newLink, title} = this.props

    return (
      <Panel>
        <PanelHeading>
          <span className='is-flex v-centered'>
            <span>{title}</span>
            <Link
              className='ml-auto button is-link is-small'
              to={newLink}
            >
              <FaPlus />&nbsp; New
            </Link>
          </span>
        </PanelHeading>
        {itemIds.map(itemId => {
          const item = itemsById[itemId]
          return (
            <PanelBlock key={itemId}>
              <CRUDItemRow<T>
                nameKey={nameKey}
                editLink={editLink(item)}
                item={item}
                onRemove={this.props.onRemove}
              />
            </PanelBlock>
          )
        })}
      </Panel>
    )
  }
}
