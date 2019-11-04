test.todo('Implement and test Modal')
// import React from 'react'
// import T from 'react-dom/test-utils'
// import {Modal} from './Modal'
// import {TestUtils} from '../test-utils'
//
// describe('Modal', () => {
//
//   class TestToggle extends React.PureComponent<{}, {visible: boolean}> {
//     constructor(props: {}) {
//       super(props)
//       this.state = {
//         visible: false,
//       }
//     }
//     toggle = () => {
//       this.setState({
//         visible: !this.state.visible,
//       })
//     }
//     render() {
//       return (
//         <div>
//           <button onClick={this.toggle}>Toggle</button>
//           <Modal isActive={this.state.visible}>
//             hi!
//           </Modal>
//         </div>
//       )
//     }
//   }
//
//   describe('isActive', () => {
//     const t = new TestUtils()
//
//     it('toggles is-active via isActive property', () => {
//       const {node} = t.render(<TestToggle />)
//       expect(node.innerHTML).toContain('hi!')
//       const modal = node.querySelector('.modal') as HTMLElement
//       expect(modal.className).toEqual('modal')
//       T.Simulate.click(node.querySelector('button') as HTMLElement)
//       expect(modal.className).toEqual('modal is-active')
//       T.Simulate.click(node.querySelector('button') as HTMLElement)
//       expect(modal.className).toEqual('modal')
//     })
//   })
//
// })
