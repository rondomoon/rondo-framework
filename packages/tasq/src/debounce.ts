export function debounce<A, R>(fn: (...args: A[]) => R, delay: number) {
  let timeout: NodeJS.Timeout | null = null

  return function debounceImpl(...args: A[]): void {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
