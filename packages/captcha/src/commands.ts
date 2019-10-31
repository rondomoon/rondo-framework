export interface ESpeakOptions {

}

export interface OpusOptions {
}

export function espeak(config: ESpeakOptions) {
  return {
    cmd: 'espeak',
    args: ['-k', '2', '-s', '90', '--stdin', '--stdout'],
    contentType: 'audio/wav',
  }
}

export function opusenc(config: OpusOptions) {
  return {
    cmd: 'opusenc',
    args: ['-', '-'],
    contentType: 'audio/opus',
  }
}
