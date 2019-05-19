declare module 'react-ssr-prepass' {
  import {Component, ReactElement} from 'react'

  export type Visitor = (
    element: ReactElement,
    instance?: Component,
  ) => void | Promise<any>

  function ssrPrepass(node: ReactElement, visitor?: Visitor): Promise<void>

  export = ssrPrepass
}
