import { espeak, opusenc } from './commands'

describe('espeak', () => {
  it('returns espeak arguments', () => {
    expect(espeak({})).toEqual({
      cmd: 'espeak',
      args: ['-k', '2', '-s', '90', '--stdin', '--stdout'],
      contentType: 'audio/wav',
    })
  })
})

describe('opus', () => {
  it('returns opusenc arguments', () => {
    expect(opusenc({})).toEqual({
      cmd: 'opusenc',
      args: ['-', '-'],
      contentType: 'audio/opus',
    })
  })
})
