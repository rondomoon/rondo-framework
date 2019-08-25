export function getDefaultParams(): string {
  if (typeof process !== 'undefined' &&
    typeof process.env !== 'undefined' &&
    typeof process.env.LOG !== 'undefined') {
    return process.env.LOG
  }
  if (
    typeof window !== 'undefined' &&
    window.localStorage &&
    typeof window.localStorage.getItem === 'function'
  ) {
    return window.localStorage.getItem('LOG') || ''
  }
  return ''
}
