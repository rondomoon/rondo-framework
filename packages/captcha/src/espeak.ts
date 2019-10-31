export function espeak() {
  return {
    cmd: 'espeak',
    args: ['-k', '2', '-s', '90', '--stdin', '--stdout'],
    contentType: 'audio/wav',
  }
}

export function opus() {
  return {
    cmd: 'opusenc',
    args: ['-', '-'],
    contentType: 'audio/opus',
  }
}
