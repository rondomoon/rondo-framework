import React from 'react'
import {Button, Panel, PanelHeading, PanelBlock} from '../components'
import {FaPlus, FaEdit, FaTimes} from 'react-icons/fa'
import {Link} from '../components'

export interface CRUDListProps<T> {
  nameKey: keyof T
  editLink?: (item: T) => string
  itemIds: ReadonlyArray<number>
  itemsById: Record<number, T>
  newLink?: string
  onRemove?: (t: T) => void
  title: string
  Info?: React.ComponentType<CRUDItemInfoProps<T>>
  RowButtons?: React.ComponentType<CRUDRowButtons<T>>
}

export interface CRUDRowButtons<T> {
  item: T
}

export interface CRUDItemRowProps<T> {
  Info?: React.ComponentType<CRUDItemInfoProps<T>>
  RowButtons?: React.ComponentType<CRUDRowButtons<T>>
  nameKey: keyof T
  editLink?: string
  item: T
  onRemove?: (t: T) => void
}

export interface CRUDItemInfoProps<T> {
  item: T
  nameKey: keyof T
}

export class CRUDItemInfo<T>
extends React.PureComponent<CRUDItemInfoProps<T>> {
  render() {
    const {item, nameKey} = this.props
    return <span>{item[nameKey]}</span>
  }
}

export class CRUDItemRow<T> extends React.PureComponent<CRUDItemRowProps<T>> {
  handleRemove = () => {
    const {onRemove, item} = this.props
    if (onRemove) {
      onRemove(item)
    }
  }
  render() {
    const {nameKey, editLink, item} = this.props

    return (
      <React.Fragment>
        <div className='item-info'>
          {this.props.Info
            ? <this.props.Info item={item} nameKey={nameKey} />
            : <CRUDItemInfo<T> item={item} nameKey={nameKey} />
          }
        </div>
        <div className='ml-auto'>
          {!!this.props.RowButtons && (
            <this.props.RowButtons item={item} />
          )}
          &nbsp;
          {!!editLink && (
            <Link to={editLink}>
              <Button colorScheme='primary' aria-label='Edit'>
                <FaEdit />
              </Button>
            </Link>
          )}
          &nbsp;
          {!!this.props.onRemove && (
            <Button
              aria-label='Remove'
              onClick={this.handleRemove}
              colorScheme='danger'
            >
              <FaTimes />
            </Button>
          )}
        </div>
      </React.Fragment>
    )
  }
}

export class CRUDList<T> extends React.PureComponent<CRUDListProps<T>> {
  render() {
    const {nameKey, editLink, itemIds, itemsById, newLink, title} = this.props

    return (
      <Panel>
        <PanelHeading>
          <span className='is-flex v-centered'>
            <span>{title}</span>
            {!!newLink && (
              <Link
                className='ml-auto button is-link is-small'
                to={newLink}
              >
                <FaPlus />&nbsp; New
              </Link>
            )}
          </span>
        </PanelHeading>
        {itemIds.map(itemId => {
          const item = itemsById[itemId]
          return (
            <PanelBlock key={itemId}>
              <CRUDItemRow<T>
                Info={this.props.Info}
                RowButtons={this.props.RowButtons}
                nameKey={nameKey}
                editLink={editLink && editLink(item)}
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
