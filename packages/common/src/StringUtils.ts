export function ellipsis(text: string | undefined, maxLength = 255): string {
  if (maxLength <= 0 || text === undefined) {
    return ''
  }
  if (text.length <= maxLength) {
    return text
  }
  let str = text.trim().substring(0, maxLength)
  const index = str.lastIndexOf(' ')
  if (index === -1) {
    return str.length > 3 ? str.substring(0, str.length - 3) + '...' : str
  }
  str = str.substring(0, index) + '...'
  return ellipsis(str, maxLength)
}

export function trim(str?: string) {
  if (!str) {
    return ''
  }
  return str.trim()
}
