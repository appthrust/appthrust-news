import { describe, expect, test } from 'bun:test'
import type { Item, ItemList, Latest } from '../api/news'
import { newsRoutes, type MockMode } from './mock-news'

function request(path: string, mode?: MockMode) {
  const url = new URL(`/api/news/v1${path}`, 'http://news.test')
  const response = newsRoutes(new Request(url), url, mode)
  if (!response) throw new Error(`unhandled mock route: ${path}`)
  return response
}

describe('development news contract', () => {
  test('pinned-first pagination preserves server order without duplicates', async () => {
    const first = await request('/items?limit=2').json() as ItemList
    expect(first.items[0].pinned).toBe(true)
    expect(first.items[1].id).toBe('2026-11-10-release')
    const second = await request(`/items?limit=2&cursor=${first.nextCursor}`).json() as ItemList
    const third = await request(`/items?limit=2&cursor=${second.nextCursor}`).json() as ItemList
    const items = [...first.items, ...second.items, ...third.items]
    expect(items).toHaveLength(6)
    expect(new Set(items.map((item) => item.id)).size).toBe(6)
    expect(third.nextCursor).toBeUndefined()
    expect(new Set(items.map((item) => item.category)).size).toBe(6)
    expect(items.every((item) => Array.isArray(item.tags))).toBe(true)
    expect(items.some((item) => item.updatedAt)).toBe(true)
  })

  test('category filtering, locale fallback and newest-unpinned selection', async () => {
    const filtered = await request('/items?category=maintenance&locale=en').json() as ItemList
    expect(filtered.items).toHaveLength(1)
    expect(filtered.items[0].locale).toBe('ja')
    expect(filtered.edition.itemCount).toBe(6)
    const english = await request('/items/2026-11-08-welcome?locale=en').json() as Item
    expect(english.locale).toBe('en')
    expect(english.title).toBe('Welcome to AppThrust News')
    expect((await request('/items?locale=unknown').json() as ItemList).items[0].locale).toBe('ja')
    expect((await request('/latest').json() as Latest)).toHaveProperty('id', '2026-11-10-release')
  })

  test('invalid query and item errors use stable HTTP codes', async () => {
    for (const [path, status, code] of [
      ['/items?category=nope', 400, 'invalid_category'],
      ['/items?limit=0', 400, 'invalid_limit'], ['/items?limit=101', 400, 'invalid_limit'],
      ['/items?limit=2.5', 400, 'invalid_limit'], ['/items?cursor=nope', 400, 'invalid_cursor'],
      ['/items/nope', 404, 'not_found'],
    ] as const) {
      const response = request(path)
      expect(response.status).toBe(status)
      expect(await response.json()).toHaveProperty('error', code)
    }
  })

  test('empty editions and unavailable content are distinct real responses', async () => {
    expect(await request('/items', 'empty').json()).toEqual({ items: [], edition: { version: '1.0.0', itemCount: 0 } })
    expect(await request('/latest', 'empty').json()).toEqual({ edition: { version: '1.0.0', itemCount: 0 } })
    const unavailable = request('/items', 'content_unavailable')
    expect(unavailable.status).toBe(503)
    expect(await unavailable.json()).toHaveProperty('error', 'content_unavailable')
  })
})
