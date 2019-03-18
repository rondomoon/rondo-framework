export function isClientSide() {
  return typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement === 'function' &&
    typeof (window as any).__MOCK_SERVER_SIDE__ === 'undefined'
}
