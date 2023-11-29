export type TrackType = 'profile';
export declare function buildEndpoint(site: string, clientToken: string, trackType: TrackType, configurationTags: string[], transport: 'beacon' | 'fetch'): string;
