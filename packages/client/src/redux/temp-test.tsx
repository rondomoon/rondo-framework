// import React from 'react'
// import {connect, Omit} from 'react-redux'

// interface IProps {
//   a: number
// }

// class NumberDisplay extends React.PureComponent<IProps> {
//   render() {
//     return `${this.props.a}`
//   }
// }

// // Case 1: this works
// function mapStateToProps(state: any) {
//   return {a: 1}
// }

// const ConnectedNumberDisplay1 = connect(mapStateToProps)(NumberDisplay)

// export const display1 = <ConnectedNumberDisplay1 />

// // Case 2: this doesn't work
// function wrap<State, StateProps, ComponentProps>(
//   mapState: (state: State) => StateProps,
//   Component: React.ComponentType<ComponentProps>,
// ): React.ComponentType<
//   Omit<ComponentProps, keyof StateProps & keyof ComponentProps>
//   > {
//   return connect(mapState)(Component as any) as any
// }

// const ConnectedNumberDisplay2 = wrap(mapStateToProps, NumberDisplay)
// export const display2 = <ConnectedNumberDisplay2 />
