/**
 * Mock user agent string to make it stable across different test environments.
 */
export function mockUserAgent() {
  const originalNavigator = window.navigator
  const mockedNavigator = {
    ...originalNavigator,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
  }
  Object.defineProperty(window, 'navigator', {
    value: mockedNavigator,
    writable: true,
  })

  afterAll(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })
}
