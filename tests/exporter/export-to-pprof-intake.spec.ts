import 'blob-polyfill'
import { Profile } from 'pprof-format'

import { fakeConfig } from '../fake-config'
import { mockFetch } from '../mock-fetch'
import { mockSendBeacon } from '../mock-send-beacon'
import { mockUserAgent } from '../mock-user-agent'
import { resolveProfile } from '../resolve-profile'
import type { RumProfilerTrace } from '../../src/types'

import { trace as playgroundTrace } from './__fixtures__/playground-trace'
import { trace as zeroIndexTrace } from './__fixtures__/zero-index-trace'
import { exportToPprofIntake } from '../../src/exporter/export-to-pprof-intake'

describe('exportToPprofIntake', () => {
  const { extractIntakeUrlAndFormDataFromSendBeacon } = mockSendBeacon(false)
  const { extractIntakeUrlAndFormDataFromFetch } = mockFetch()
  mockUserAgent()

  it('exports a playground trace', async () => {
    await exportToPprofIntake(playgroundTrace as unknown as RumProfilerTrace, fakeConfig)

    // We try send beacon first, then fallback to fetch
    const { intakeUrl: intakeUrlFromSendBeacon, formData: formDataFromBeacon } =
      extractIntakeUrlAndFormDataFromSendBeacon()
    const { intakeUrl: intakeUrlFromFetch, formData: formDataFromFetch } = extractIntakeUrlAndFormDataFromFetch()

    // Send beacon URL
    expect(intakeUrlFromSendBeacon.protocol).toBe('https:')
    expect(intakeUrlFromSendBeacon.hostname).toBe('browser-intake-datad0g.com')
    expect(intakeUrlFromSendBeacon.pathname).toBe('/api/v2/profile')
    expect(intakeUrlFromSendBeacon.hash).toBe('')
    expect(intakeUrlFromSendBeacon.searchParams.get('ddsource')).toBe('browser')
    expect(intakeUrlFromSendBeacon.searchParams.get('ddtags')).toBe('api:beacon')
    expect(intakeUrlFromSendBeacon.searchParams.get('dd-api-key')).toBe('my-client-token')
    expect(intakeUrlFromSendBeacon.searchParams.get('dd-evp-origin')).toBe('browser')
    expect(intakeUrlFromSendBeacon.searchParams.get('dd-request-id')).toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
    )

    // Fetch URL
    expect(intakeUrlFromFetch.protocol).toBe('https:')
    expect(intakeUrlFromFetch.hostname).toBe('browser-intake-datad0g.com')
    expect(intakeUrlFromFetch.pathname).toBe('/api/v2/profile')
    expect(intakeUrlFromFetch.hash).toBe('')
    expect(intakeUrlFromFetch.searchParams.get('ddsource')).toBe('browser')
    expect(intakeUrlFromFetch.searchParams.get('ddtags')).toBe('api:fetch')
    expect(intakeUrlFromFetch.searchParams.get('dd-api-key')).toBe('my-client-token')
    expect(intakeUrlFromFetch.searchParams.get('dd-evp-origin')).toBe('browser')
    expect(intakeUrlFromFetch.searchParams.get('dd-request-id')).toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
    )

    // We should use the same form data object for both sendBeacon and fetch
    expect(formDataFromBeacon).toBe(formDataFromFetch)
    // As they are the same, simplify the rest of the test
    const formData = formDataFromBeacon

    const eventBlob = formData.get('event') as Blob
    expect(eventBlob).toBeDefined()
    expect(eventBlob.type).toBe('application/json')
    expect(eventBlob.size).toBeGreaterThan(0)
    expect(JSON.parse(await eventBlob.text())).toEqual({
      attachments: ['wall-time.pprof'],
      start: '2001-09-09T01:46:40.000Z',
      end: '2001-09-09T01:46:40.012Z',
      family: 'chrome',
      tags_profiler: [
        'service:my-service',
        'version:my-version',
        'env:my-env',
        'application_id:my-application-id',
        'language:javascript',
        'runtime:chrome',
        'family:chrome',
        'format:pprof',
        'host:mozilla/5.0_macintosh_intel_mac_os_x_10_15_7_applewebkit/537.36_khtml_like_gecko_',
        'git.commit.sha:my-commit-hash',
        'git.repository_url:https://my-repository-url',
      ].join(','),
      version: '4',
    })

    const wallTimeBlob = formData.get('wall-time.pprof') as Blob
    expect(wallTimeBlob).toBeDefined()
    expect(wallTimeBlob.type).toBe('application/octet-stream')
    expect(wallTimeBlob.size).toBeGreaterThan(0)

    // Resolve internal references to make the test easier to read
    const profile = resolveProfile(
      // Decode with a different library (pprof-format) to be sure our encoding is correct
      Profile.decode(new Uint8Array(await wallTimeBlob.arrayBuffer()))
    )

    expect(profile.comments).toEqual([])
    expect(profile.mappings).toEqual([])
    expect(profile.dropFrames).toBe(0)
    expect(profile.keepFrames).toBe(0)
    expect(profile.durationNanos).toBe(12_000_000) // 12 milliseconds (in nanoseconds)
    expect(profile.period).toBe(10_000_000) // 10 milliseconds (in nanoseconds)

    expect(profile.periodType).toBeDefined()
    expect(profile.sampleTypes).toHaveLength(3)
    expect(profile.periodType).toEqual({
      type: 'wall-time',
      unit: 'nanoseconds',
    })
    expect(profile.sampleTypes).toEqual([
      {
        type: 'wall-time',
        unit: 'nanoseconds',
      },
      {
        type: 'long-task-time',
        unit: 'nanoseconds',
      },
      {
        type: 'sample',
        unit: 'count',
      },
    ])

    const knownLocations = {
      Profiler: profile.locations[0],
      anonymous_rumProfiler: profile.locations[1],
      start_rumProfiler: profile.locations[2],
      anonymous_main: profile.locations[3],
      functionD_computeHeavyThings: profile.locations[4],
      functionC_computeHeavyThings: profile.locations[5],
      functionB_computeHeavyThings: profile.locations[6],
      functionA_computeHeavyThings: profile.locations[7],
    }

    expect(knownLocations.Profiler).toMatchInlineSnapshot(`
      {
        "column": 0,
        "function": {
          "filename": "",
          "id": 1,
          "name": "Profiler",
          "startLine": 0,
          "systemName": "Profiler",
        },
        "id": 1,
        "line": 0,
      }
    `)
    expect(knownLocations.functionA_computeHeavyThings).toMatchInlineSnapshot(`
      {
        "column": 19,
        "function": {
          "filename": "http://localhost:5173/computeHeavyThings.ts",
          "id": 8,
          "name": "functionA",
          "startLine": 0,
          "systemName": "functionA",
        },
        "id": 8,
        "line": 1,
      }
    `)
    expect(knownLocations.functionB_computeHeavyThings).toMatchInlineSnapshot(`
      {
        "column": 19,
        "function": {
          "filename": "http://localhost:5173/computeHeavyThings.ts",
          "id": 7,
          "name": "functionB",
          "startLine": 0,
          "systemName": "functionB",
        },
        "id": 7,
        "line": 4,
      }
    `)
    expect(knownLocations.functionC_computeHeavyThings).toMatchInlineSnapshot(`
      {
        "column": 19,
        "function": {
          "filename": "http://localhost:5173/computeHeavyThings.ts",
          "id": 6,
          "name": "functionC",
          "startLine": 0,
          "systemName": "functionC",
        },
        "id": 6,
        "line": 7,
      }
    `)
    expect(knownLocations.functionD_computeHeavyThings).toMatchInlineSnapshot(`
      {
        "column": 19,
        "function": {
          "filename": "http://localhost:5173/computeHeavyThings.ts",
          "id": 5,
          "name": "functionD",
          "startLine": 0,
          "systemName": "functionD",
        },
        "id": 5,
        "line": 10,
      }
    `)

    const emptySamples = profile.samples.filter((sample) => sample.locations.length === 0)
    expect(emptySamples).toHaveLength(0)

    const knownSamples = {
      Profiler: profile.samples.filter((sample) => sample.locations.includes(knownLocations.Profiler)),
    }

    expect(knownSamples.Profiler).toHaveLength(3)
    const firstProfilerSample = knownSamples.Profiler[0]

    expect(firstProfilerSample.label).toHaveLength(3)
    expect(firstProfilerSample.label).toEqual([
      {
        key: 'task',
        str: 'Short Tasks',
      },
      {
        key: 'trace endpoint',
        str: '/',
      },
      {
        key: 'end_timestamp_ns',
        num: BigInt('1000000000000499968'),
      },
    ])
    expect(firstProfilerSample.locations).toHaveLength(4)
    expect(firstProfilerSample.locations).toEqual([
      knownLocations.Profiler,
      knownLocations.anonymous_rumProfiler,
      knownLocations.start_rumProfiler,
      knownLocations.anonymous_main,
    ])
    expect(firstProfilerSample.value).toHaveLength(3)
    expect(firstProfilerSample.value).toEqual([5500000, 0, 1])
  })

  it('exports trace with zero-index resource', async () => {
    await exportToPprofIntake(zeroIndexTrace as unknown as RumProfilerTrace, fakeConfig)

    const { formData } = extractIntakeUrlAndFormDataFromSendBeacon()

    const wallTimeBlob = formData.get('wall-time.pprof') as Blob
    expect(wallTimeBlob).toBeDefined()
    expect(wallTimeBlob.type).toBe('application/octet-stream')
    expect(wallTimeBlob.size).toBeGreaterThan(0)

    // Resolve internal references to make the test easier to read
    const profile = resolveProfile(
      // Decode with a different library (pprof-format) to be sure our encoding is correct
      Profile.decode(new Uint8Array(await wallTimeBlob.arrayBuffer()))
    )

    // Filenames should not be empty
    expect(profile).toMatchInlineSnapshot(`
      {
        "comments": [],
        "dropFrames": 0,
        "durationNanos": 1000000,
        "functions": [
          {
            "filename": "https://static.my-app.com/main.js",
            "id": 1,
            "name": "write",
            "startLine": 0,
            "systemName": "write",
          },
          {
            "filename": "https://static.my-app.com/main.js",
            "id": 2,
            "name": "read",
            "startLine": 0,
            "systemName": "read",
          },
        ],
        "keepFrames": 0,
        "locations": [
          {
            "column": 1,
            "function": {
              "filename": "https://static.my-app.com/main.js",
              "id": 1,
              "name": "write",
              "startLine": 0,
              "systemName": "write",
            },
            "id": 1,
            "line": 1,
          },
          {
            "column": 1,
            "function": {
              "filename": "https://static.my-app.com/main.js",
              "id": 2,
              "name": "read",
              "startLine": 0,
              "systemName": "read",
            },
            "id": 2,
            "line": 2,
          },
        ],
        "mappings": [],
        "period": 10000000,
        "periodType": {
          "type": "wall-time",
          "unit": "nanoseconds",
        },
        "sampleTypes": [
          {
            "type": "wall-time",
            "unit": "nanoseconds",
          },
          {
            "type": "long-task-time",
            "unit": "nanoseconds",
          },
          {
            "type": "sample",
            "unit": "count",
          },
        ],
        "samples": [
          {
            "label": [
              {
                "key": "task",
                "str": "Short Tasks",
              },
              {
                "key": "end_timestamp_ns",
                "num": 1000000000000499968n,
              },
            ],
            "locations": [
              {
                "column": 1,
                "function": {
                  "filename": "https://static.my-app.com/main.js",
                  "id": 1,
                  "name": "write",
                  "startLine": 0,
                  "systemName": "write",
                },
                "id": 1,
                "line": 1,
              },
              {
                "column": 1,
                "function": {
                  "filename": "https://static.my-app.com/main.js",
                  "id": 2,
                  "name": "read",
                  "startLine": 0,
                  "systemName": "read",
                },
                "id": 2,
                "line": 2,
              },
            ],
            "value": [
              5500000,
              0,
              1,
            ],
          },
        ],
      }
    `)
  })
})
