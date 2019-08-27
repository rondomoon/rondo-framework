export function debounce<A, R>(fn: (...args: A[]) => R, delay: number) {
  let timeout: NodeJS.Timeout | null = null

  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
    }
  }

  function debounceImpl(...args: A[]): void {
    cancel()

    timeout = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  debounceImpl.cancel = cancel

  return debounceImpl
}
