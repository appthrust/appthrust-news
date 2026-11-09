// The app's only HTTP client. The same-origin edge attaches the caller's
// bearer; the SPA neither requests nor stores credentials.
export type Category = 'announcement' | 'release' | 'feature' | 'maintenance' | 'incident' | 'event'
export type Locale = 'ja' | 'en'
export type ItemSummary = {
  id: string
  title: string
  summary: string
  category: Category
  publishedAt: string
  updatedAt?: string
  pinned: boolean
  tags: string[]
  locale: Locale
}
export type Item = ItemSummary & { markdown: string }
export type ItemList = { items: ItemSummary[]; nextCursor?: string; edition: Edition }
export type Latest = { id: string; publishedAt: string; edition: Edition } | { edition: Edition }
export type Edition = { version: string; itemCount: number }
export type ApiError = { error: string; message: string }

export class NewsApiError extends Error {
  readonly status: number
  readonly code: string
  readonly transient: boolean

  constructor(status: number, body: Partial<ApiError> | undefined) {
    const code = typeof body?.error === 'string' ? body.error : undefined
    super(body?.message || `appthrust-news api ${status}`)
    this.name = 'NewsApiError'
    this.status = status
    this.code = code ?? (status === 404 ? 'not_found' : 'unknown')
    this.transient = code === undefined && (status === 0 || status >= 500)
  }
}

export function isNewsError(error: unknown, code?: string): error is NewsApiError {
  return error instanceof NewsApiError && (code === undefined || error.code === code)
}

export const BASE = '/api/news/v1'
const READ_TIMEOUT_MS = 8_000
const REAUTH_WINDOW_MS = 60_000
const REAUTH_AT_KEY = 'appthrust-news:reauth-at'
type Fetcher = (input: string, init: RequestInit) => Promise<Response>
export type ListOptions = { locale: Locale; category?: Category; cursor?: string; limit?: number; signal?: AbortSignal }
export interface NewsApi {
  items(options: ListOptions): Promise<ItemList>
  item(id: string, locale: Locale, signal?: AbortSignal): Promise<Item>
  latest(signal?: AbortSignal): Promise<Latest>
}

export function createNewsApi(fetcher: Fetcher = (input, init) => fetch(input, init), reauth = browserReauth): NewsApi {
  async function json<T>(path: string, signal?: AbortSignal): Promise<T> {
    let response: Response
    try {
      const timeout = AbortSignal.timeout(READ_TIMEOUT_MS)
      response = await fetcher(`${BASE}${path}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      })
    } catch (error) {
      if (signal?.aborted) throw error
      throw new NewsApiError(0, undefined)
    }
    if (response.status === 401 && reauth()) return new Promise<T>(() => {})
    if (!response.ok) {
      let parsed: Partial<ApiError> | undefined
      try {
        parsed = (await response.json()) as Partial<ApiError>
      } catch {
        parsed = undefined
      }
      throw new NewsApiError(response.status, parsed)
    }
    return (await response.json()) as T
  }
  return {
    items: ({ locale, category, cursor, limit, signal }) => {
      const query = new URLSearchParams({ locale })
      if (category !== undefined) query.set('category', category)
      if (cursor !== undefined) query.set('cursor', cursor)
      if (limit !== undefined) query.set('limit', String(limit))
      return json<ItemList>(`/items?${query}`, signal)
    },
    item: (id, locale, signal) => json<Item>(`/items/${encodeURIComponent(id)}?locale=${locale}`, signal),
    latest: (signal) => json<Latest>('/latest', signal),
  }
}

function browserReauth(): boolean {
  // Storage-denied browsers must not enter an unbounded sign-in loop.
  try {
    const lastReauthAt = Number(sessionStorage.getItem(REAUTH_AT_KEY))
    if (Date.now() - lastReauthAt < REAUTH_WINDOW_MS) return false
    sessionStorage.setItem(REAUTH_AT_KEY, String(Date.now()))
  } catch {
    return false
  }
  window.location.assign('/')
  return true
}

export const newsApi = createNewsApi()
