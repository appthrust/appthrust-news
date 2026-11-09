import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet, useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { FileQuestion } from 'lucide-react'
import { isNewsError } from '../api/news'
import { useText } from '../i18n'
import { Shell } from '../shell/shell'
import { EmptyState, LinkButton, Loading, LoadFailed, useDocumentTitle } from '../ui'
import { paths } from './paths'

export type RouterContext = { queryClient: QueryClient }

export function NotFound() {
  const { t } = useText()
  useDocumentTitle(t('news.notFound.title'))
  return <div className="mx-auto max-w-lg py-12"><EmptyState icon={<FileQuestion />} heading="h1" title={t('news.notFound.title')} body={t('news.notFound.body')} action={<LinkButton href={paths.home} tone="primary">{t('news.item.back')}</LinkButton>} /></div>
}

export function RouteError({ error }: ErrorComponentProps) {
  const router = useRouter()
  if (isNewsError(error, 'not_found')) return <NotFound />
  return <LoadFailed error={error} onRetry={() => void router.invalidate()} />
}

export function RoutePending() {
  return <Loading />
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Shell><Outlet /></Shell>,
  errorComponent: RouteError,
  pendingComponent: RoutePending,
  notFoundComponent: NotFound,
})
