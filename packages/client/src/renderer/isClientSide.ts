interface MockServerSide {
  __MOCK_SERVER_SIDE__?: boolean
}

export function isClientSide() {
  return typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement === 'function' &&
    typeof (window as MockServerSide).__MOCK_SERVER_SIDE__ === 'undefined'
}
