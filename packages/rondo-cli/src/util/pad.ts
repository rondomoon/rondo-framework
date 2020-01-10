export function padLeft(text: string, size: number) {
  while (text.length < size) {
    text = ' ' + text
  }
  return text
}

export function padRight(text: string, size: number) {
  while (text.length < size) {
    text = text + ' '
  }
  return text
}
