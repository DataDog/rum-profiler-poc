import IntervalTree from '@flatten-js/interval-tree';

export class Timeline<TEntry> {
    private tree: IntervalTree;

    constructor(
        entries: TEntry[],
        private readonly getStartTime: (entry: TEntry) => number,
        private readonly getEndTime: (entry: TEntry) => number,
    ) {
        // Use interval tree for O(log n) time complexity
        // Based on Cormen et al. Introduction to Algorithms (2009, Section 14.3: Interval trees, pp. 348–354)
        // https://en.wikipedia.org/wiki/Interval_tree
        this.tree = new IntervalTree();
        for (const entry of entries) {
            this.tree.insert(
                [this.getStartTime(entry), this.getEndTime(entry)],
                entry,
            );
        }
    }

    get(sampleTime: number): TEntry[] {
        return this.tree.search([sampleTime, sampleTime]) as TEntry[];
    }
}
