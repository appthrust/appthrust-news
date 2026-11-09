import { BASE, type Category, type Edition, type Item, type ItemList, type Latest } from '../api/news'
import { localizedItems } from './fixtures'

export const mockConfig = { projectId: 'pj-demo', publicUrl: `http://localhost:${process.env.APPTHRUST_NEWS_PORT ?? 5258}` }
export type MockMode = 'ok' | 'empty' | 'content_unavailable'
const categories: readonly Category[] = ['announcement', 'release', 'feature', 'maintenance', 'incident', 'event']
const compareNewest = (a: Item, b: Item) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || b.id.localeCompare(a.id)
const fail = (status: number, error: string, message: string) => Response.json({ error, message }, { status })

export function newsRoutes(request: Request, url: URL, mode: MockMode = 'ok'): Response | undefined {
  if (request.method !== 'GET') return undefined
  if (url.pathname === '/config') return Response.json(mockConfig)
  if (!url.pathname.startsWith(`${BASE}/`)) return undefined
  if (mode === 'content_unavailable') return fail(503, 'content_unavailable', 'news content is unavailable')
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'ja'
  const items = mode === 'empty' ? [] : localizedItems(locale)
  const edition: Edition = { version: '1.0.0', itemCount: items.length }
  if (url.pathname === `${BASE}/latest`) {
    const newest = items.sort(compareNewest)[0]
    const latest: Latest = newest ? { id: newest.id, publishedAt: newest.publishedAt, edition } : { edition }
    return Response.json(latest)
  }
  if (url.pathname === `${BASE}/items`) {
    const category = url.searchParams.get('category')
    if (category && !categories.includes(category as Category)) return fail(400, 'invalid_category', 'unknown category')
    const rawLimit = url.searchParams.get('limit')
    const limit = rawLimit === null || rawLimit === '' ? 20 : Number(rawLimit)
    if ((rawLimit && !/^\d+$/.test(rawLimit)) || !Number.isInteger(limit) || limit < 1 || limit > 100) return fail(400, 'invalid_limit', 'limit must be between 1 and 100')
    const ordered = items.filter((item) => !category || item.category === category).sort((a, b) => Number(b.pinned) - Number(a.pinned) || compareNewest(a, b))
    const cursor = url.searchParams.get('cursor')
    const previous = cursor ? ordered.findIndex((item) => item.id === cursor) : -1
    if (cursor && previous === -1) return fail(400, 'invalid_cursor', 'unknown cursor')
    const page = ordered.slice(previous + 1, previous + 1 + limit)
    const result: ItemList = {
      items: page.map(({ markdown: _markdown, ...summary }) => summary),
      edition,
      ...(previous + 1 + limit < ordered.length ? { nextCursor: page[page.length - 1].id } : {}),
    }
    return Response.json(result)
  }
  const match = url.pathname.match(/^\/api\/news\/v1\/items\/([^/]+)$/)
  if (match) {
    let id: string
    try { id = decodeURIComponent(match[1]) } catch { return fail(404, 'not_found', 'item not found') }
    const item = items.find((entry) => entry.id === id)
    return item ? Response.json(item) : fail(404, 'not_found', 'item not found')
  }
  return fail(404, 'not_found', 'route not found')
}
