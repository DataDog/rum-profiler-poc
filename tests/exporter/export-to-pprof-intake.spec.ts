import "blob-polyfill";
import { Profile } from "pprof-format";

import { fakeConfig } from "../fake-config";
import { mockFetch } from "../mock-fetch";
import { mockSendBeacon } from "../mock-send-beacon";
import { mockUserAgent } from "../mock-user-agent";
import { resolveProfile } from "../resolve-profile";

import { trace as playgroundTrace } from "./__fixtures__/playground-trace";
import { trace as zeroIndexTrace } from "./__fixtures__/zero-index-trace";
import { RumProfilerTrace } from "../../src/types";
import { exportToPprofIntake } from "../../src/exporter/export-to-pprof-intake";

describe("exportToPprofIntake", () => {
  const { extractIntakeUrlAndFormDataFromSendBeacon } = mockSendBeacon(false);
  const { extractIntakeUrlAndFormDataFromFetch } = mockFetch();
  mockUserAgent();

  it("exports a playground trace", async () => {
    await exportToPprofIntake(
      playgroundTrace as unknown as RumProfilerTrace,
      fakeConfig
    );

    // We try send beacon first, then fallback to fetch
    const { intakeUrl: intakeUrlFromSendBeacon, formData: formDataFromBeacon } =
      extractIntakeUrlAndFormDataFromSendBeacon();
    const { intakeUrl: intakeUrlFromFetch, formData: formDataFromFetch } =
      extractIntakeUrlAndFormDataFromFetch();

    // Send beacon URL
    expect(intakeUrlFromSendBeacon.protocol).toBe("https:");
    expect(intakeUrlFromSendBeacon.hostname).toBe("browser-intake-datad0g.com");
    expect(intakeUrlFromSendBeacon.pathname).toBe("/api/v2/profile");
    expect(intakeUrlFromSendBeacon.hash).toBe("");
    expect(intakeUrlFromSendBeacon.searchParams.get("ddsource")).toBe(
      "browser"
    );
    expect(intakeUrlFromSendBeacon.searchParams.get("ddtags")).toBe(
      "api:beacon"
    );
    expect(intakeUrlFromSendBeacon.searchParams.get("dd-api-key")).toBe(
      "my-client-token"
    );
    expect(intakeUrlFromSendBeacon.searchParams.get("dd-evp-origin")).toBe(
      "browser"
    );
    expect(intakeUrlFromSendBeacon.searchParams.get("dd-request-id")).toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
    );

    // Fetch URL
    expect(intakeUrlFromFetch.protocol).toBe("https:");
    expect(intakeUrlFromFetch.hostname).toBe("browser-intake-datad0g.com");
    expect(intakeUrlFromFetch.pathname).toBe("/api/v2/profile");
    expect(intakeUrlFromFetch.hash).toBe("");
    expect(intakeUrlFromFetch.searchParams.get("ddsource")).toBe("browser");
    expect(intakeUrlFromFetch.searchParams.get("ddtags")).toBe("api:fetch");
    expect(intakeUrlFromFetch.searchParams.get("dd-api-key")).toBe(
      "my-client-token"
    );
    expect(intakeUrlFromFetch.searchParams.get("dd-evp-origin")).toBe(
      "browser"
    );
    expect(intakeUrlFromFetch.searchParams.get("dd-request-id")).toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
    );

    // We should use the same form data object for both sendBeacon and fetch
    expect(formDataFromBeacon).toBe(formDataFromFetch);
    // As they are the same, simplify the rest of the test
    const formData = formDataFromBeacon;

    const eventBlob = formData.get("event") as Blob;
    expect(eventBlob).toBeDefined();
    expect(eventBlob.type).toBe("application/json");
    expect(eventBlob.size).toBeGreaterThan(0);
    expect(JSON.parse(await eventBlob.text())).toEqual({
      attachments: ["wall-time.pprof"],
      start: "2023-12-05T18:50:39.599Z",
      end: "2023-12-05T18:51:38.146Z",
      family: "chrome",
      tags_profiler: [
        "service:my-service",
        "version:my-version",
        "env:my-env",
        "application_id:my-application-id",
        "language:javascript",
        "runtime:chrome",
        "family:chrome",
        "format:pprof",
        "host:mozilla/5.0_macintosh_intel_mac_os_x_10_15_7_applewebkit/537.36_khtml_like_gecko_",
      ].join(","),
      version: "4",
    });

    const wallTimeBlob = formData.get("wall-time.pprof") as Blob;
    expect(wallTimeBlob).toBeDefined();
    expect(wallTimeBlob.type).toBe("application/octet-stream");
    expect(wallTimeBlob.size).toBeGreaterThan(0);

    // Resolve internal references to make the test easier to read
    const profile = resolveProfile(
      // Decode with a different library (pprof-format) to be sure our encoding is correct
      Profile.decode(new Uint8Array(await wallTimeBlob.arrayBuffer()))
    );

    expect(profile.comments).toEqual([]);
    expect(profile.mappings).toEqual([]);
    expect(profile.dropFrames).toBe(0);
    expect(profile.keepFrames).toBe(0);
    expect(profile.durationNanos).toBe(BigInt("58546500000")); // 58 seconds, 546 milliseconds, 500 microseconds (in nanoseconds)
    expect(profile.period).toBe(10_000_000); // 10 milliseconds (in nanoseconds)

    expect(profile.periodType).toBeDefined();
    expect(profile.sampleTypes).toHaveLength(3);
    expect(profile.periodType).toEqual({
      type: "wall-time",
      unit: "nanoseconds",
    });
    expect(profile.sampleTypes).toEqual([
      {
        type: "wall-time",
        unit: "nanoseconds",
      },
      {
        type: "long-task-time",
        unit: "nanoseconds",
      },
      {
        type: "sample",
        unit: "count",
      },
    ]);

    const knownLocations = {
      // JS Self-Profiling function
      Profiler: profile.locations.find(
        (loc) => loc.function.name === "Profiler"
      )!,
      // handleClick function is recorder when user clicks on a button inside HeavyComputation component
      handleClick: profile.locations.find(
        (loc) => loc.function.name === "handleClick"
      )!,
      // Counter component function is recorded on useMemo(heavyComputations) call
      Counter: profile.locations.find(
        (loc) => loc.function.name === "Counter"
      )!,
      // These functions are related to heavyComputation call stack
      functionA: profile.locations.find(
        (loc) => loc.function.name === "functionA"
      )!,
      functionB: profile.locations.find(
        (loc) => loc.function.name === "functionB"
      )!,
      functionC: profile.locations.find(
        (loc) => loc.function.name === "functionC"
      )!,
      functionD: profile.locations.find(
        (loc) => loc.function.name === "functionD"
      )!,
    };
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
    `);
    expect(knownLocations.handleClick).toMatchInlineSnapshot(`
      {
        "column": 23,
        "function": {
          "filename": "http://localhost:5173/components/HeavyComputation.tsx",
          "id": 46,
          "name": "handleClick",
          "startLine": 0,
          "systemName": "handleClick",
        },
        "id": 51,
        "line": 4,
      }
    `);
    expect(knownLocations.Counter).toMatchInlineSnapshot(`
      {
        "column": 24,
        "function": {
          "filename": "http://localhost:5173/components/Counter.tsx",
          "id": 13,
          "name": "Counter",
          "startLine": 0,
          "systemName": "Counter",
        },
        "id": 13,
        "line": 3,
      }
    `);
    expect(knownLocations.functionA).toMatchInlineSnapshot(`
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
    `);
    expect(knownLocations.functionB).toMatchInlineSnapshot(`
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
    `);
    expect(knownLocations.functionC).toMatchInlineSnapshot(`
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
    `);
    expect(knownLocations.functionD).toMatchInlineSnapshot(`
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
    `);

    const emptySamples = profile.samples.filter(
      (sample) => sample.locations.length === 0
    );
    expect(emptySamples).toHaveLength(0);

    const knownSamples = {
      Profiler: profile.samples.filter((sample) =>
        sample.locations.includes(knownLocations.Profiler)
      ),
      handleClick: profile.samples.filter((sample) =>
        sample.locations.includes(knownLocations.handleClick)
      ),
      Counter: profile.samples.filter((sample) =>
        sample.locations.includes(knownLocations.Counter)
      ),
    };

    expect(knownSamples.Profiler).toHaveLength(1);
    expect(knownSamples.Profiler[0]).toMatchInlineSnapshot(`
      {
        "label": [
          {
            "key": "task",
            "str": "Inferred Task (1701802239595)",
          },
          {
            "key": "trace endpoint",
            "str": "/",
          },
          {
            "key": "end_timestamp_ns",
            "num": 1701802239601387520n,
          },
        ],
        "locations": [
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
          },
          {
            "column": 37,
            "function": {
              "filename": "http://localhost:5173/@fs/Users/dev/rum-profiler-poc/src/rumProfiler.ts",
              "id": 2,
              "name": "(anonymous)",
              "startLine": 0,
              "systemName": "(anonymous)",
            },
            "id": 2,
            "line": 19,
          },
          {
            "column": 8,
            "function": {
              "filename": "http://localhost:5173/@fs/Users/dev/rum-profiler-poc/src/rumProfiler.ts",
              "id": 3,
              "name": "start",
              "startLine": 0,
              "systemName": "start",
            },
            "id": 3,
            "line": 169,
          },
          {
            "column": 1,
            "function": {
              "filename": "http://localhost:5173/main.tsx",
              "id": 4,
              "name": "(anonymous)",
              "startLine": 0,
              "systemName": "(anonymous)",
            },
            "id": 4,
            "line": 1,
          },
        ],
        "value": [
          6377500,
          0,
          1,
        ],
      }
    `);

    expect(knownSamples.handleClick).toHaveLength(917);
    expect(knownSamples.handleClick[0]).toMatchInlineSnapshot(`
      {
        "label": [
          {
            "key": "task",
            "str": "Long Task (1701802251091)",
          },
          {
            "key": "measure",
            "str": "heavy",
          },
          {
            "key": "event",
            "str": "click (11229)",
          },
          {
            "key": "trace endpoint",
            "str": "/",
          },
          {
            "key": "end_timestamp_ns",
            "num": 1701802251101384960n,
          },
        ],
        "locations": [
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
          },
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
          },
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
          },
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
          },
          {
            "column": 23,
            "function": {
              "filename": "http://localhost:5173/components/HeavyComputation.tsx",
              "id": 46,
              "name": "handleClick",
              "startLine": 0,
              "systemName": "handleClick",
            },
            "id": 51,
            "line": 4,
          },
          {
            "column": 37,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 47,
              "name": "callCallback2",
              "startLine": 0,
              "systemName": "callCallback2",
            },
            "id": 52,
            "line": 3671,
          },
          {
            "column": 0,
            "function": {
              "filename": "",
              "id": 48,
              "name": "dispatchEvent",
              "startLine": 0,
              "systemName": "dispatchEvent",
            },
            "id": 53,
            "line": 0,
          },
          {
            "column": 74,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 49,
              "name": "invokeGuardedCallbackDev",
              "startLine": 0,
              "systemName": "invokeGuardedCallbackDev",
            },
            "id": 54,
            "line": 3655,
          },
          {
            "column": 39,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 50,
              "name": "invokeGuardedCallback",
              "startLine": 0,
              "systemName": "invokeGuardedCallback",
            },
            "id": 55,
            "line": 3730,
          },
          {
            "column": 57,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 51,
              "name": "invokeGuardedCallbackAndCatchFirstError",
              "startLine": 0,
              "systemName": "invokeGuardedCallbackAndCatchFirstError",
            },
            "id": 56,
            "line": 3735,
          },
          {
            "column": 33,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 52,
              "name": "executeDispatch",
              "startLine": 0,
              "systemName": "executeDispatch",
            },
            "id": 57,
            "line": 7013,
          },
          {
            "column": 50,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 53,
              "name": "processDispatchQueueItemsInOrder",
              "startLine": 0,
              "systemName": "processDispatchQueueItemsInOrder",
            },
            "id": 58,
            "line": 7019,
          },
          {
            "column": 38,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 54,
              "name": "processDispatchQueue",
              "startLine": 0,
              "systemName": "processDispatchQueue",
            },
            "id": 59,
            "line": 7041,
          },
          {
            "column": 42,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 34,
              "name": "dispatchEventsForPlugins",
              "startLine": 0,
              "systemName": "dispatchEventsForPlugins",
            },
            "id": 37,
            "line": 7049,
          },
          {
            "column": 34,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 35,
              "name": "(anonymous)",
              "startLine": 0,
              "systemName": "(anonymous)",
            },
            "id": 38,
            "line": 7176,
          },
          {
            "column": 34,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 36,
              "name": "batchedUpdates$1",
              "startLine": 0,
              "systemName": "batchedUpdates$1",
            },
            "id": 39,
            "line": 18905,
          },
          {
            "column": 32,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 37,
              "name": "batchedUpdates",
              "startLine": 0,
              "systemName": "batchedUpdates",
            },
            "id": 40,
            "line": 3573,
          },
          {
            "column": 51,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 38,
              "name": "dispatchEventForPluginEventSystem",
              "startLine": 0,
              "systemName": "dispatchEventForPluginEventSystem",
            },
            "id": 41,
            "line": 7129,
          },
          {
            "column": 97,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 39,
              "name": "dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay",
              "startLine": 0,
              "systemName": "dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay",
            },
            "id": 42,
            "line": 5475,
          },
          {
            "column": 31,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 40,
              "name": "dispatchEvent",
              "startLine": 0,
              "systemName": "dispatchEvent",
            },
            "id": 43,
            "line": 5467,
          },
          {
            "column": 39,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 41,
              "name": "dispatchDiscreteEvent",
              "startLine": 0,
              "systemName": "dispatchDiscreteEvent",
            },
            "id": 44,
            "line": 5443,
          },
        ],
        "value": [
          9500000,
          9500000,
          1,
        ],
      }
    `);

    expect(knownSamples.Counter).toHaveLength(1150);
    expect(knownSamples.Counter[0]).toMatchInlineSnapshot(`
      {
        "label": [
          {
            "key": "task",
            "str": "Long Task (1701802239601)",
          },
          {
            "key": "measure",
            "str": "heavy",
          },
          {
            "key": "trace endpoint",
            "str": "/",
          },
          {
            "key": "end_timestamp_ns",
            "num": 1701802239607744768n,
          },
        ],
        "locations": [
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
          },
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
          },
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
          },
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
          },
          {
            "column": 36,
            "function": {
              "filename": "http://localhost:5173/components/Counter.tsx",
              "id": 9,
              "name": "(anonymous)",
              "startLine": 0,
              "systemName": "(anonymous)",
            },
            "id": 9,
            "line": 8,
          },
          {
            "column": 27,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 10,
              "name": "mountMemo",
              "startLine": 0,
              "systemName": "mountMemo",
            },
            "id": 10,
            "line": 12814,
          },
          {
            "column": 30,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 11,
              "name": "useMemo",
              "startLine": 0,
              "systemName": "useMemo",
            },
            "id": 11,
            "line": 13134,
          },
          {
            "column": 25,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/chunk-BZN7XFWI.js",
              "id": 12,
              "name": "useMemo",
              "startLine": 0,
              "systemName": "useMemo",
            },
            "id": 12,
            "line": 1092,
          },
          {
            "column": 24,
            "function": {
              "filename": "http://localhost:5173/components/Counter.tsx",
              "id": 13,
              "name": "Counter",
              "startLine": 0,
              "systemName": "Counter",
            },
            "id": 13,
            "line": 3,
          },
          {
            "column": 33,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 14,
              "name": "renderWithHooks",
              "startLine": 0,
              "systemName": "renderWithHooks",
            },
            "id": 14,
            "line": 12151,
          },
          {
            "column": 45,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 15,
              "name": "mountIndeterminateComponent",
              "startLine": 0,
              "systemName": "mountIndeterminateComponent",
            },
            "id": 15,
            "line": 14894,
          },
          {
            "column": 27,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 16,
              "name": "beginWork",
              "startLine": 0,
              "systemName": "beginWork",
            },
            "id": 16,
            "line": 15865,
          },
          {
            "column": 33,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 17,
              "name": "beginWork$1",
              "startLine": 0,
              "systemName": "beginWork$1",
            },
            "id": 17,
            "line": 19746,
          },
          {
            "column": 35,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 18,
              "name": "performUnitOfWork",
              "startLine": 0,
              "systemName": "performUnitOfWork",
            },
            "id": 18,
            "line": 19188,
          },
          {
            "column": 30,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 19,
              "name": "workLoopSync",
              "startLine": 0,
              "systemName": "workLoopSync",
            },
            "id": 19,
            "line": 19131,
          },
          {
            "column": 32,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 20,
              "name": "renderRootSync",
              "startLine": 0,
              "systemName": "renderRootSync",
            },
            "id": 20,
            "line": 19089,
          },
          {
            "column": 45,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 21,
              "name": "performConcurrentWorkOnRoot",
              "startLine": 0,
              "systemName": "performConcurrentWorkOnRoot",
            },
            "id": 21,
            "line": 18653,
          },
          {
            "column": 26,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 22,
              "name": "workLoop",
              "startLine": 0,
              "systemName": "workLoop",
            },
            "id": 22,
            "line": 184,
          },
          {
            "column": 27,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 23,
              "name": "flushWork",
              "startLine": 0,
              "systemName": "flushWork",
            },
            "id": 23,
            "line": 155,
          },
          {
            "column": 48,
            "function": {
              "filename": "http://localhost:5173/node_modules/.vite/deps/react-dom_client.js",
              "id": 24,
              "name": "performWorkUntilDeadline",
              "startLine": 0,
              "systemName": "performWorkUntilDeadline",
            },
            "id": 24,
            "line": 377,
          },
        ],
        "value": [
          6357499,
          6357499,
          1,
        ],
      }
    `);
  });

  it("exports trace with zero-index resource", async () => {
    await exportToPprofIntake(
      zeroIndexTrace as unknown as RumProfilerTrace,
      fakeConfig
    );

    const { formData } = extractIntakeUrlAndFormDataFromSendBeacon();

    const wallTimeBlob = formData.get("wall-time.pprof") as Blob;
    expect(wallTimeBlob).toBeDefined();
    expect(wallTimeBlob.type).toBe("application/octet-stream");
    expect(wallTimeBlob.size).toBeGreaterThan(0);

    // Resolve internal references to make the test easier to read
    const profile = resolveProfile(
      // Decode with a different library (pprof-format) to be sure our encoding is correct
      Profile.decode(new Uint8Array(await wallTimeBlob.arrayBuffer()))
    );

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
                "str": "Inferred Task (999999999995)",
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
    `);
  });
});
