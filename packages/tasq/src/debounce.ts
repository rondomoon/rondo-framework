export function debounce<A, R>(fn: (...args: A[]) => R, delay: number) {
  let timeout: NodeJS.Timeout | null = null

  return async function debounceImpl(...args: A[]) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
