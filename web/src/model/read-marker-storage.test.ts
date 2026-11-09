import { afterEach, expect, test } from 'bun:test'
import { advanceReadMarker, READ_MARKER_KEY, readMarker } from './read-marker-storage'

const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
afterEach(() => {
  if (original) Object.defineProperty(globalThis, 'localStorage', original)
  else Reflect.deleteProperty(globalThis, 'localStorage')
})

test('storage denial and full storage never prevent reading news', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('denied') } })
  expect(readMarker()).toBeUndefined()
  expect(() => advanceReadMarker('2026-11-10T00:00:00Z')).not.toThrow()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() { throw new Error('quota') } } })
  expect(() => advanceReadMarker('2026-11-10T00:00:00Z')).not.toThrow()
})

test('storage writes the designated object key and preserves a newer marker', () => {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } })
  advanceReadMarker('2026-11-10T00:00:00Z')
  advanceReadMarker('2026-11-09T00:00:00Z')
  expect([...values.keys()]).toEqual(['appthrust-news:last-seen'])
  expect(values.get(READ_MARKER_KEY)).toBe('{"lastSeenPublishedAt":"2026-11-10T00:00:00Z"}')
})
