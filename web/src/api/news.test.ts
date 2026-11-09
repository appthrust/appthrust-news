import { describe, expect, test } from 'bun:test'
import { newsRoutes } from '../dev/mock-news'
import { createNewsApi, NewsApiError } from './news'

describe('news API client', () => {
  test('uses exact same-origin routes, locale and opaque cursor without credentials in headers', async () => {
    const calls: { input: string; init: RequestInit }[] = []
    const api = createNewsApi(async (input, init) => {
      calls.push({ input, init })
      const url = new URL(input, 'http://news.test')
      return newsRoutes(new Request(url), url) ?? new Response('', { status: 404 })
    })
    const page = await api.items({ locale: 'en', limit: 2 })
    expect(page.items).toHaveLength(2)
    expect(page.items[0].pinned).toBe(true)
    expect('markdown' in page.items[0]).toBe(false)
    await api.items({ locale: 'ja', category: 'release', cursor: '2026-11-10-release', limit: 2 })
    const item = await api.item('2026-11-07-maintenance', 'en')
    expect(item.locale).toBe('ja')
    expect(item.markdown).toBeTruthy()
    expect(await api.latest()).toEqual({ id: '2026-11-10-release', publishedAt: '2026-11-10T09:00:00+09:00', edition: { version: '1.0.0', itemCount: 6 } })
    expect(calls.map((call) => call.input)).toEqual([
      '/api/news/v1/items?locale=en&limit=2',
      '/api/news/v1/items?locale=ja&category=release&cursor=2026-11-10-release&limit=2',
      '/api/news/v1/items/2026-11-07-maintenance?locale=en',
      '/api/news/v1/latest',
    ])
    for (const call of calls) {
      expect(call.init.credentials).toBe('same-origin')
      expect(call.init.method).toBe('GET')
      expect(new Headers(call.init.headers).has('Authorization')).toBe(false)
    }
  })

  test('escapes the item identifier as a single segment', async () => {
    let path = ''
    const api = createNewsApi(async (input) => { path = input; return Response.json({}) })
    await api.item('a/b ?#', 'en')
    expect(path).toBe('/api/news/v1/items/a%2Fb%20%3F%23?locale=en')
  })

  test('preserves stable error envelopes and distinguishes unstructured failures', async () => {
    for (const [status, code] of [[404, 'not_found'], [503, 'content_unavailable'], [400, 'invalid_cursor']] as const) {
      const api = createNewsApi(async () => Response.json({ error: code, message: 'server message' }, { status }), () => false)
      const error = await api.latest().catch((error: unknown) => error) as NewsApiError
      expect(error).toBeInstanceOf(NewsApiError)
      expect([error.status, error.code, error.message, error.transient]).toEqual([status, code, 'server message', false])
    }
    const proxy = createNewsApi(async () => new Response('<html>bad gateway</html>', { status: 502 }))
    expect((await proxy.latest().catch((error: NewsApiError) => error) as NewsApiError).transient).toBe(true)
    const offline = createNewsApi(async () => { throw new TypeError('offline') })
    const error = await offline.latest().catch((error: NewsApiError) => error) as NewsApiError
    expect([error.status, error.transient]).toEqual([0, true])
  })

  test('401 hands over to bounded reauthentication without settling the obsolete request', async () => {
    const redirected = Promise.withResolvers<void>()
    const api = createNewsApi(async () => Response.json({ error: 'unauthenticated', message: '' }, { status: 401 }), () => { redirected.resolve(); return true })
    let settled = false
    void api.latest().then(() => { settled = true }, () => { settled = true })
    await redirected.promise
    for (let tick = 0; tick < 5; tick++) await Promise.resolve()
    expect(settled).toBe(false)
  })
})
