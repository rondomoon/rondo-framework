import { TextStream } from './TextStream'

describe('TextStream', () => {

  it('creates a text stream', async () => {
    const stream = new TextStream('test')
    const data = await new Promise((resolve, reject) => {
      let text = ''
      stream.on('error', reject)
      stream.on('data', data => {
        text += data.toString()
      })
      stream.on('end', () => {
        resolve(text)
      })
    })
    expect(data).toBe('test')
  })

  describe('_read', () => {
    it('does nothing', () => {
      const stream = new TextStream('test')
      expect(stream._read()).toBe(undefined)
    })
  })

})
