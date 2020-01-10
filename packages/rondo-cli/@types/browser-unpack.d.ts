declare module 'browser-unpack' {
  function Unpack(filename: string): Module[]
  export interface Module {
    id: number | string
    source: string
    deps: Record<string, string | number>
  }
  export = Unpack
}
