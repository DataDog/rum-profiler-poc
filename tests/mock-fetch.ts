export function mockFetch() {
    const originalFetch = window.fetch;

    const fetchMock = jest.fn(
        (_input: RequestInfo | URL, _init?: RequestInit) =>
            Promise.resolve(new Response()),
    );
    window.fetch = fetchMock as unknown as typeof window.fetch;

    afterEach(() => {
        fetchMock.mockClear();
    });
    afterAll(() => {
        window.fetch = originalFetch;
    });

    function extractIntakeUrlAndFormDataFromFetch(callIndex = 0) {
        if (!fetchMock.mock.calls[callIndex]) {
            throw new Error(`No fetch call found at index ${callIndex}`);
        }

        const [intakeUrl, request] = fetchMock.mock.calls[callIndex] as [
            string,
            { body: FormData; method: string },
        ];

        return {
            intakeUrl: new URL(intakeUrl),
            formData: request.body,
            method: request.method,
        };
    }

    return { fetchMock, extractIntakeUrlAndFormDataFromFetch };
}
