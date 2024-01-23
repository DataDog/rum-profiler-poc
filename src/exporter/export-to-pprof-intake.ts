import { EventsTimeline } from '../timeline/events-timeline';
import { InferredTasksTimeline } from '../timeline/inferred-tasks-timeline';
import { InteractionsTimeline } from '../timeline/interactions-timeline';
import { LongTasksTimeline } from '../timeline/long-tasks-timeline';
import { MeasuresTimeline } from '../timeline/measures-timeline';
import { NavigationTimeline } from '../timeline/navigation-timeline';
import type {
    RumProfilerTraceExporter,
    RumProfilerTrace,
    RumProfilerConfig,
} from '../types';
import { getRum } from '../utils/get-rum';
import { SamplesView } from '../utils/samples-view';
import { StringsTable } from '../utils/strings-table';

import { buildEndpoint } from './build-endpoint';
import {
    Function,
    Label,
    Line,
    Location,
    Profile,
    Sample,
    ValueType,
} from './pprof-profile';

const ANONYMOUS_FUNCTION = '(anonymous)';

/**
 * Exports pprof profile to public profiling intake.
 * @param trace RUM trace to export
 * @param config Configuration of the profiler
 * @returns Promise that resolves when profile is sent
 */
export const exportToPprofIntake: RumProfilerTraceExporter = (
    trace,
    config,
): Promise<void> => {
    const pprof = buildPprof(trace);

    return sendPprof(
        new Date(trace.timeOrigin + trace.startTime),
        new Date(trace.timeOrigin + trace.endTime),
        pprof,
        config,
    );
};

/**
 * Translates RumProfilerTrace to pprof profile.
 * Pprof is an OpenSource binary format for profiling data:
 * https://github.com/google/pprof/blob/main/proto/profile.proto
 *
 * It's a temporary solution for the PoC - in the future this will be moved to the backend.
 *
 * @param trace RUM Profiler trace to translate into pprof profile (binary format)
 * @returns pprof profile in binary format
 */
function buildPprof(trace: RumProfilerTrace): Blob {
    const stringsTable = new StringsTable();
    const functions: Function[] = [];
    const locations: Location[] = [];
    const samples: Sample[] = [];

    const samplesView = new SamplesView(trace);

    const longTasksTimeline = new LongTasksTimeline(trace);
    const inferredTasksTimeline = new InferredTasksTimeline(trace);
    const measuresTimeline = new MeasuresTimeline(trace);
    const eventsTimeline = new EventsTimeline(trace);
    const interactionsTimeline = new InteractionsTimeline(trace);
    const navigationTimeline = new NavigationTimeline(trace);

    for (let frameIndex = 0; frameIndex < trace.frames.length; frameIndex++) {
        const frame = trace.frames[frameIndex];

        const filename =
            frame.resourceId !== undefined
                ? stringsTable.dedup(trace.resources[frame.resourceId])
                : 0;
        const name = stringsTable.dedup(frame.name || ANONYMOUS_FUNCTION);
        const systemName = name; // Use the same name for system name as we don't have un-minification on the client side

        // Naive O(N) deduplication, it can be optimized
        let functionIndex = functions.findIndex(
            (fn) =>
                fn.filename === filename &&
                fn.name === name &&
                fn.systemName === systemName,
        );
        // Add function if needed
        if (functionIndex === -1) {
            functionIndex = functions.length;
            functions.push(
                Function.fromPartial({
                    id: functions.length + 1, // Function ids are 1-based
                    filename,
                    name,
                    systemName,
                }),
            );
        }

        locations.push(
            Location.fromPartial({
                id: locations.length + 1, // Location ids are 1-based
                line: [
                    Line.fromPartial({
                        functionId: functions[functionIndex].id,
                        // encode column in high 32-bits of a 64-bit integer
                        line: {
                            high: frame.column || 0,
                            low: frame.line || 0,
                            unsigned: true,
                        },
                    }),
                ],
            }),
        );
    }

    if (trace.samples.length) {
        for (let index = 0; index < trace.samples.length; index++) {
            const sample = trace.samples[index];

            // Collect location ids from the stack
            const locationIds: number[] = [];
            let stackId = sample.stackId;
            while (stackId !== undefined) {
                const { frameId, parentId } = trace.stacks[stackId];
                // frameId is 0-based index of the frame in the trace.frames array
                // It's in sync with locations array as we push a new location in order for each frame
                locationIds.push(locations[frameId].id);
                stackId = parentId;
            }

            if (locationIds.length === 0) {
                // Skip idle samples
                continue;
            }

            const sampleStartTime = samplesView.getStartTime(index);
            const sampleMiddleTime = samplesView.getMiddleTime(index);
            const sampleEndTime = samplesView.getEndTime(index);

            const longTasks = longTasksTimeline.get(sampleMiddleTime);
            const inferredTasks = inferredTasksTimeline.get(sampleMiddleTime);
            const measures = measuresTimeline.get(sampleMiddleTime);
            const events = eventsTimeline.get(sampleMiddleTime);
            const interactions = interactionsTimeline.get(sampleMiddleTime);
            const navigation = navigationTimeline.get(sampleMiddleTime);

            const labels: Label[] = [];
            for (const longTask of longTasks) {
                // Prefer official long tasks source
                labels.push(
                    Label.fromPartial({
                        key: stringsTable.dedup('task'),
                        str: stringsTable.dedup(
                            `Long Task (${Math.round(
                                trace.timeOrigin + longTask.startTime,
                            )})`,
                        ),
                    }),
                );
            }
            if (!longTasks.length) {
                // Fallback to inferred tasks if no long tasks found
                for (const inferredTask of inferredTasks) {
                    labels.push(
                        Label.fromPartial({
                            key: stringsTable.dedup('task'),
                            str:
                                inferredTask.duration > 50
                                    ? stringsTable.dedup(
                                          `Inferred Long Task (${Math.round(
                                              trace.timeOrigin +
                                                  inferredTask.startTime,
                                          )})`,
                                      )
                                    : stringsTable.dedup(
                                          `Inferred Task (${Math.round(
                                              trace.timeOrigin +
                                                  inferredTask.startTime,
                                          )})`,
                                      ),
                        }),
                    );
                }
            }
            for (const measure of measures) {
                labels.push(
                    Label.fromPartial({
                        key: stringsTable.dedup('measure'),
                        str: stringsTable.dedup(measure.name),
                    }),
                );
            }
            for (const event of events) {
                labels.push(
                    Label.fromPartial({
                        key: stringsTable.dedup('event'),
                        str: stringsTable.dedup(
                            `${event.name} (${Math.round(event.startTime)})`,
                        ),
                    }),
                );
            }
            for (const interaction of interactions) {
                labels.push(
                    Label.fromPartial({
                        key: stringsTable.dedup('interaction'),
                        str: stringsTable.dedup(`${interaction.interactionId}`),
                    }),
                );
            }
            for (const entry of navigation) {
                labels.push(
                    Label.fromPartial({
                        // Special label for aggregation by endpoint feature
                        key: stringsTable.dedup('trace endpoint'),
                        str: stringsTable.dedup(entry.name),
                    }),
                );
            }

            labels.push(
                Label.fromPartial({
                    // Special label for timeline feature
                    key: stringsTable.dedup('end_timestamp_ns'),
                    num: (trace.timeOrigin + sampleEndTime) * 1e6,
                }),
            );

            // Calculate values
            const wallTime = (sampleEndTime - sampleStartTime) * 1e6;

            const longTaskTime = longTasks.length ? wallTime : 0;

            const sampleCount = 1;

            samples.push(
                Sample.fromPartial({
                    locationId: locationIds,
                    value: [wallTime, longTaskTime, sampleCount],
                    label: labels,
                }),
            );
        }
    }
    const sampleType = [
        ValueType.fromPartial({
            type: stringsTable.dedup('wall-time'),
            unit: stringsTable.dedup('nanoseconds'),
        }),
        ValueType.fromPartial({
            type: stringsTable.dedup('long-task-time'),
            unit: stringsTable.dedup('nanoseconds'),
        }),
        ValueType.fromPartial({
            type: stringsTable.dedup('sample'),
            unit: stringsTable.dedup('count'),
        }),
    ];
    const periodType = ValueType.fromPartial({
        type: stringsTable.dedup('wall-time'),
        unit: stringsTable.dedup('nanoseconds'),
    });

    const profile = Profile.fromPartial({
        sampleType,
        defaultSampleType: 0,
        periodType,
        period: trace.sampleInterval * 1e6,
        durationNanos: (trace.endTime - trace.startTime) * 1e6,
        timeNanos: (trace.timeOrigin + trace.startTime) * 1e6,
        function: functions,
        location: locations,
        sample: samples,
        stringTable: Array.from(stringsTable),
    });

    return new Blob([Profile.encode(profile).finish()], {
        type: 'application/octet-stream',
    });
}

/**
 * Sends pprof profile to public profiling intake.
 *
 * @param start Start of the profile
 * @param end End of the profile
 * @param pprof Profile in pprof binary format
 * @param config Configuration of the profiler
 * @returns Promise that resolves when profile is sent
 */
function sendPprof(
    start: Date,
    end: Date,
    pprof: Blob,
    config: RumProfilerConfig,
): Promise<void> {
    const eventTags = [
        `service:${config.service}`,
        `version:${config.version}`,
        `env:${config.env || 'unknown'}`,
        `application_id:${config.applicationId}`,
        'language:javascript',
        'runtime:chrome',
        'family:chrome',
        'format:pprof',
        // TODO: replace with RUM device id in the future
        `host:${navigator.userAgent
            .replace(/[^a-zA-Z0-9_\-:./]/g, '_')
            .replace(/__/g, '_')
            .toLowerCase()
            .slice(0, 200)}`,
    ];
    const sessionId = getRum()?.getInternalContext()?.session_id;
    if (sessionId) {
        eventTags.push(`session_id:${sessionId}`);
    }

    const event = {
        attachments: ['wall-time.pprof'],
        start: start.toISOString(),
        end: end.toISOString(),
        family: 'chrome',
        tags_profiler: eventTags.join(','),
        version: '4',
    };

    const formData = new FormData();
    formData.append(
        'event',
        new Blob([JSON.stringify(event)], { type: 'application/json' }),
        'event.json',
    );
    formData.append('wall-time.pprof', pprof, 'wall-time.pprof');

    const buildEndpointForTransport = (transport: 'beacon' | 'fetch') =>
        buildEndpoint(
            config.site,
            config.clientToken,
            'profile',
            [],
            transport,
        );

    // Try with beacon first as it's more reliable on unload event
    // Unfortunately, there is a limitation on payload size so it might not work for some cases
    const didSendWithBeacon = navigator.sendBeacon(
        buildEndpointForTransport('beacon'),
        formData,
    );
    if (!didSendWithBeacon) {
        // fetch is less reliable on unload event, but we have no choice if payload is too big
        return fetch(buildEndpointForTransport('fetch'), {
            method: 'POST',
            body: formData,
        }).then(() => undefined);
    }

    return Promise.resolve();
}
