export function mockSendBeacon(shouldSucceed = false) {
  const originalSendBeacon = navigator.sendBeacon

  const sendBeaconMock = jest.fn((_intakeUrl: string, _body: FormData) => shouldSucceed)
  navigator.sendBeacon = sendBeaconMock

  afterEach(() => {
    sendBeaconMock.mockClear()
  })
  afterAll(() => {
    navigator.sendBeacon = originalSendBeacon
  })

  function extractIntakeUrlAndFormDataFromSendBeacon(callIndex = 0) {
    if (!sendBeaconMock.mock.calls[callIndex]) {
      throw new Error(`No sendBeacon call found at index ${callIndex}`)
    }

    const [intakeUrl, formData] = sendBeaconMock.mock.calls[callIndex] as [string, FormData]

    return { intakeUrl: new URL(intakeUrl), formData }
  }

  return { sendBeaconMock, extractIntakeUrlAndFormDataFromSendBeacon }
}
