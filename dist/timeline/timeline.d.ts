export declare class Timeline<TEntry> {
    private readonly getStartTime;
    private readonly getEndTime;
    private tree;
    constructor(entries: TEntry[], getStartTime: (entry: TEntry) => number, getEndTime: (entry: TEntry) => number);
    get(sampleTime: number): TEntry[];
}
