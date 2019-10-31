import { Readable } from 'stream'

export class TextStream extends Readable {
  constructor(text: string) {
    super()
    this.push(text)
    this.push(null)
  }
  _read() {/* noop */}
}

