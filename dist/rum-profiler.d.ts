import type { RumProfilerConfig } from './types';
export declare class RumProfiler {
    private readonly config;
    private readonly observer;
    private session;
    constructor(config: RumProfilerConfig);
    get supported(): boolean;
    start(): void;
    stop(): Promise<void>;
    private startNextProfilerSession;
    private collectProfilerSession;
    private stopProfilerSession;
    private collectNavigationEntry;
    private handleProfilerTrace;
    private handleSampleBufferFull;
    private handlePerformance;
    private handleEntries;
    private handleNavigate;
    private handleVisibilityChange;
    private handleBeforeUnload;
}
