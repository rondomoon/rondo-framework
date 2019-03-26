import {Modal as M, ModalBackground, ModalContent, ModalClose} from 'bloomer'
import React from 'react'

export interface IModalProps {
  isActive?: boolean
}

export class Modal extends React.PureComponent<IModalProps> {
  render() {
    return (
      <M isActive={this.props.isActive}>
        <ModalBackground />
        <ModalContent>
          {this.props.children}
       </ModalContent>
       <ModalClose />
      </M>
    )
  }
}
