import { infiniteQueryOptions, QueryClient, queryOptions } from '@tanstack/react-query'
import { newsApi, NewsApiError, type Category, type Locale } from './news'

const TRANSIENT_RETRIES = 3
export const retryQuery = (failureCount: number, error: unknown) =>
  error instanceof NewsApiError && !error.transient ? false : failureCount < TRANSIENT_RETRIES

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: retryQuery, retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000), staleTime: 5 * 60_000 },
  },
})

const NEWS_KEY = ['appthrust-news'] as const
export const itemsQuery = (locale: Locale, category?: Category) => infiniteQueryOptions({
  queryKey: [...NEWS_KEY, 'items', locale, category],
  initialPageParam: undefined as string | undefined,
  queryFn: ({ pageParam, signal }) => newsApi.items({ locale, category, cursor: pageParam, limit: 5, signal }),
  getNextPageParam: (page) => page.nextCursor,
})
export const itemQuery = (id: string, locale: Locale) => queryOptions({
  queryKey: [...NEWS_KEY, 'item', id, locale],
  queryFn: ({ signal }) => newsApi.item(id, locale, signal),
})
export const latestQuery = queryOptions({ queryKey: [...NEWS_KEY, 'latest'], queryFn: ({ signal }) => newsApi.latest(signal) })
