import type { Profile } from 'pprof-format';

const low32n = BigInt('0x00000000ffffffff');
const high32n = BigInt('0xffffffff00000000');
const shift32n = BigInt('32');

/**
 * It uses pprof-format package to denormalize profile data.
 * It simplifies tests of profile data.
 */
export function resolveProfile(profile: Profile) {
    // Resolve strings
    const periodType = profile.periodType
        ? {
              type: profile.stringTable.strings[
                  profile.periodType.type as number
              ],
              unit: profile.stringTable.strings[
                  profile.periodType.unit as number
              ],
          }
        : undefined;
    const sampleTypes = profile.sampleType.map((sampleType) => ({
        type: profile.stringTable.strings[sampleType.type as number],
        unit: profile.stringTable.strings[sampleType.unit as number],
    }));

    const functions = profile.function.map((fn) => ({
        id: fn.id,
        filename: profile.stringTable.strings[fn.filename as number],
        name: profile.stringTable.strings[fn.name as number],
        systemName: profile.stringTable.strings[fn.systemName as number],
        startLine: fn.startLine,
    }));
    const functionsMap = Object.fromEntries(functions.map((fn) => [fn.id, fn]));
    const locations = profile.location.map((loc) => ({
        id: loc.id,
        function: functionsMap[loc.line[0].functionId as number],
        // eslint-disable-next-line no-bitwise
        line: Number(BigInt(loc.line[0].line) & low32n),
        // eslint-disable-next-line no-bitwise
        column: Number((BigInt(loc.line[0].line) & high32n) >> shift32n),
    }));
    const locationsMap = Object.fromEntries(
        locations.map((loc) => [loc.id, loc]),
    );

    const samples = profile.sample.map((sample) => ({
        label: sample.label.map((label) => {
            if (label.str) {
                return {
                    key: profile.stringTable.strings[label.key as number],
                    str: label.str
                        ? profile.stringTable.strings[label.str as number]
                        : undefined,
                };
            } else {
                const resolvedLabel: {
                    key: string;
                    num: number | bigint;
                    numUnit?: string;
                } = {
                    key: profile.stringTable.strings[label.key as number],
                    num: label.num,
                };
                if (label.numUnit) {
                    resolvedLabel.numUnit =
                        profile.stringTable.strings[label.numUnit as number];
                }
                return resolvedLabel;
            }
        }),
        locations: sample.locationId.map(
            (locationId) => locationsMap[locationId as number],
        ),
        value: sample.value,
    }));

    const comments = profile.comment.map(
        (comment) => profile.stringTable.strings[comment as number],
    );
    const mappings = profile.mapping.map((mapping) => ({
        id: mapping.id,
        memoryStart: mapping.memoryStart,
        memoryLimit: mapping.memoryLimit,
        filename: profile.stringTable.strings[mapping.filename as number],
        hasFunctions: mapping.hasFunctions,
    }));

    return {
        comments,
        mappings,
        dropFrames: profile.dropFrames,
        keepFrames: profile.keepFrames,
        durationNanos: profile.durationNanos,
        period: profile.period,
        periodType,
        sampleTypes,
        samples,
        functions,
        locations,
    };
}
