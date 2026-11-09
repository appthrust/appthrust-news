import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import { createNewsApi, NewsApiError } from '../api/news'
import { itemQuery, itemsQuery, latestQuery } from '../api/queries'
import { newsRoutes, type MockMode } from '../dev/mock-news'
import { I18nProvider } from '../i18n'
import { LoadFailed, Loading } from '../ui'
import { routeTree } from './pages'

const globals = globalThis as unknown as Record<string, unknown>
const savedWindow = globals.window
const dom = new JSDOM('', { url: 'http://news.test/' })
beforeAll(() => { globals.window = dom.window })
afterAll(() => { globals.window = savedWindow; dom.window.close() })

async function renderRoute(path: string, language: 'ja' | 'en', mode: MockMode = 'ok') {
  const api = createNewsApi(async (input) => {
    const url = new URL(input, 'http://news.test')
    return newsRoutes(new Request(url), url, mode) ?? new Response('', { status: 404 })
  })
  // Render the response already loaded through the mock, including terminal 404s.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, retryOnMount: false, staleTime: Infinity } } })
  client.setQueryData(itemsQuery(language).queryKey, { pages: [await api.items({ locale: language, limit: 5 })], pageParams: [undefined] })
  client.setQueryData(latestQuery.queryKey, await api.latest())
  if (path.startsWith('/items/')) {
    const id = path.slice('/items/'.length)
    await client.fetchQuery({ ...itemQuery(id, language), queryFn: () => api.item(id, language) }).catch(() => {})
  }
  const router = createRouter({ routeTree, context: { queryClient: client }, history: createMemoryHistory({ initialEntries: [path] }) })
  await router.load()
  const html = renderToString(<QueryClientProvider client={client}><I18nProvider language={language}><RouterProvider router={router} /></I18nProvider></QueryClientProvider>)
  client.clear()
  return html.replaceAll('<!-- -->', '')
}

describe('news screens', () => {
  test('Japanese home shows server order, filters, unread markers, load-more and edition footer', async () => {
    const html = await renderRoute('/', 'ja')
    expect(html).toContain('AppThrust の最新情報')
    expect(html.indexOf('AppThrust News へようこそ')).toBeLessThan(html.indexOf('11 月のアップデート'))
    expect(html).toContain('カテゴリで絞り込む')
    expect(html).toContain('未読')
    expect(html).toContain('もっと見る')
    expect(html).toContain('エディション 1.0.0')
    expect(html).toContain('最新の公開日：2026年11月10日')
    expect(html).toContain('href="/items/2026-11-08-welcome"')
  })

  test('article renders API markdown and corrections', async () => {
    const html = await renderRoute('/items/2026-11-09-marketplace', 'ja')
    expect(html).toContain('マーケットプレイスで、必要なアプリを見つけやすく')
    expect(html).toContain('<h2>アプリを探す</h2>')
    expect(html).toContain('訂正：2026年11月10日')
    expect(html).toContain('ニュース一覧へ戻る')
  })

  test('English chrome and API content use the requested locale and show fallback notes', async () => {
    const english = await renderRoute('/items/2026-11-08-welcome', 'en')
    expect(english).toContain('Welcome to AppThrust News')
    expect(english).toContain('What you will find here')
    const fallback = await renderRoute('/items/2026-11-07-maintenance', 'en')
    expect(fallback).toContain('The Japanese edition is shown.')
    expect(fallback).toContain('定期メンテナンスについて')
    expect(fallback).toContain('lang="ja"')
  })

  test('empty edition and unknown item render explicit states', async () => {
    const empty = await renderRoute('/', 'en', 'empty')
    expect(empty).toContain('No news yet')
    expect(empty).toContain('Edition 1.0.0')
    expect(empty).not.toContain('Newest item ·')
    expect(await renderRoute('/items/missing', 'en')).toContain('Page not found')
  })

  test('loading and content_unavailable have localized visible UI', () => {
    const html = renderToString(<I18nProvider language="ja"><Loading /><LoadFailed error={new NewsApiError(503, { error: 'content_unavailable', message: 'invalid content' })} onRetry={() => {}} /></I18nProvider>)
    expect(html).toContain('読み込んでいます')
    expect(html).toContain('ニュースを現在表示できません')
    expect(html).toContain('もう一度読み込む')
    expect(html).toContain('role="alert"')
  })
})
