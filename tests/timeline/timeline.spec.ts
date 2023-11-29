import { Timeline } from "../../src/timeline/timeline";

interface TestEntry {
  id: number;
  start: number;
  end: number;
}

describe("Timeline", () => {
  it("returns list of entires for given timestamp", () => {
    // Timeline
    //        1 2 3 4 5 6 7 8 9
    // id: 1  |---|
    // id: 2    |---|
    // id: 3              |-|
    // id: 4                |
    const E1: TestEntry = { id: 1, start: 1, end: 3 };
    const E2: TestEntry = { id: 2, start: 2, end: 4 };
    const E3: TestEntry = { id: 3, start: 7, end: 8 };
    const E4: TestEntry = { id: 4, start: 8, end: 8 };

    const timeline = new Timeline<TestEntry>(
      [E1, E2, E3, E4],
      (entry) => entry.start,
      (entry) => entry.end
    );

    expect(timeline.get(0)).toEqual([]);
    expect(timeline.get(1)).toEqual([E1]);
    expect(timeline.get(1.5)).toEqual([E1]);
    expect(timeline.get(2)).toEqual([E1, E2]);
    expect(timeline.get(2.5)).toEqual([E1, E2]);
    expect(timeline.get(3)).toEqual([E1, E2]);
    expect(timeline.get(4)).toEqual([E2]);
    expect(timeline.get(5)).toEqual([]);
    expect(timeline.get(6)).toEqual([]);
    expect(timeline.get(7)).toEqual([E3]);
    expect(timeline.get(8)).toEqual([E3, E4]);
    expect(timeline.get(8.1)).toEqual([]);
    expect(timeline.get(9)).toEqual([]);

    // edge cases
    expect(timeline.get(-2)).toEqual([]);
    expect(timeline.get(20)).toEqual([]);
  });

  it("handles empty timeline", () => {
    const timeline = new Timeline<TestEntry>(
      [],
      (entry) => entry.start,
      (entry) => entry.end
    );

    expect(timeline.get(0)).toEqual([]);
    expect(timeline.get(1)).toEqual([]);
    expect(timeline.get(-2)).toEqual([]);
  });
});
