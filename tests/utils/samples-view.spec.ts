import { SamplesView } from '../../src/utils/samples-view'

describe('SamplesView', () => {
  /**
   * We have 4 samples and 20ms sampling interval:
   * |-----|-----|---------|
   * 0     1     2         3
   * 0ms   20ms  40ms      80ms
   *                       ^ something happened and this sample was taken later than expected
   */
  const trace = {
    sampleInterval: 20,
    samples: [{ timestamp: 0 }, { timestamp: 20 }, { timestamp: 40 }, { timestamp: 80 }],
  }
  const samplesView = new SamplesView(trace)

  it('adds half of the interval to the first sample', () => {
    expect(samplesView.getStartTime(0)).toEqual(-10)
    expect(samplesView.getMiddleTime(0)).toEqual(0)
    expect(samplesView.getEndTime(0)).toEqual(10)
  })

  it('adds half of the interval to the last sample', () => {
    expect(samplesView.getStartTime(3)).toEqual(60)
    expect(samplesView.getMiddleTime(3)).toEqual(80)
    expect(samplesView.getEndTime(3)).toEqual(90)
  })

  it('spreads bias between samples', () => {
    expect(samplesView.getStartTime(2)).toEqual(30)
    expect(samplesView.getMiddleTime(2)).toEqual(40)
    expect(samplesView.getEndTime(2)).toEqual(60)
  })
})
