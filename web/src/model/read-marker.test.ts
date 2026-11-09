import { describe, expect, test } from 'bun:test'
import { advance, isUnread, parse } from './read-marker'

const earlier = '2026-11-09T09:00:00+09:00'
const later = '2026-11-10T09:00:00+09:00'

describe('ReadMarker', () => {
  test('missing or garbage markers make every item unread', () => {
    for (const raw of [null, undefined, '', 'garbage', 'null', '[]', '42', '{}', '"2026-11-10"', '{"lastSeenPublishedAt":"nope"}', '{"lastSeenPublishedAt":"2026-11-10"}']) {
      const marker = parse(raw)
      expect(marker).toBeUndefined()
      expect(isUnread(marker, earlier)).toBe(true)
      expect(isUnread(marker, later)).toBe(true)
    }
  })

  test('only publications strictly newer than the marker are unread', () => {
    const marker = parse(JSON.stringify({ lastSeenPublishedAt: earlier }))
    expect(marker).toEqual({ lastSeenPublishedAt: earlier })
    expect(isUnread(marker, earlier)).toBe(false)
    expect(isUnread(marker, '2026-11-08T09:00:00+09:00')).toBe(false)
    expect(isUnread(marker, later)).toBe(true)
  })

  test('advance initializes a missing marker and never moves backwards', () => {
    const marker = advance(undefined, later)
    expect(marker).toEqual({ lastSeenPublishedAt: later })
    expect(advance(marker, earlier)).toBe(marker)
    expect(advance(marker, later)).toBe(marker)
    expect(advance(marker, 'bad date')).toBe(marker)
    expect(advance(marker, '2026-11-11T00:00:00Z')).toEqual({ lastSeenPublishedAt: '2026-11-11T00:00:00Z' })
  })

  test('ordering compares instants even with different UTC offsets', () => {
    const marker = { lastSeenPublishedAt: later }
    expect(isUnread(marker, '2026-11-10T00:00:00Z')).toBe(false)
    expect(advance(marker, '2026-11-10T00:00:00Z')).toBe(marker)
    expect(isUnread(marker, '2026-11-10T00:00:01Z')).toBe(true)
    expect(advance(marker, '2026-11-10T00:00:01Z')?.lastSeenPublishedAt).toBe('2026-11-10T00:00:01Z')
  })
})
