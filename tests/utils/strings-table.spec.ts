import { StringsTable } from '../../src/utils/strings-table'

describe('StringsTable', () => {
  it('deduplicates strings', () => {
    const stringsTable = new StringsTable()
    expect(stringsTable.dedup('foo')).toEqual(1)
    expect(stringsTable.dedup('bar')).toEqual(2)
    expect(stringsTable.dedup('foo')).toEqual(1)
    expect(stringsTable.dedup('bar')).toEqual(2)
  })

  it('returns index of empty string', () => {
    const stringsTable = new StringsTable()
    expect(stringsTable.dedup('')).toEqual(0)
  })

  it('keeps empty string at index 0', () => {
    const stringsTable = new StringsTable()
    expect(stringsTable.dedup('foo')).toEqual(1)
    expect(stringsTable.dedup('')).toEqual(0)
  })

  it('allows to export as an array with iterator', () => {
    const stringsTable = new StringsTable()
    stringsTable.dedup('foo')
    stringsTable.dedup('bar')
    stringsTable.dedup('baz')

    expect(Array.from(stringsTable)).toEqual(['', 'foo', 'bar', 'baz'])
  })
})
