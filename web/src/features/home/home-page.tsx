import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { ArrowRight, Newspaper } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Category, ItemSummary } from '../../api/news'
import { itemsQuery, latestQuery } from '../../api/queries'
import { useText } from '../../i18n'
import { advance, isUnread, type ReadMarker } from '../../model/read-marker'
import { advanceReadMarker, readMarker } from '../../model/read-marker-storage'
import { paths } from '../../routes/paths'
import { Button, cn, EmptyState, HrefLink, Loading, LoadFailed, useDocumentTitle } from '../../ui'
import { CATEGORIES, ItemMeta, NewsDate } from '../items/item-meta'

/** Keep unread indicators for this visit; commit only items actually shown on leaving. */
function useReadMarker(items: ItemSummary[]) {
  const [marker] = useState(readMarker)
  const shown = useRef<ReadMarker | undefined>(undefined)
  useEffect(() => {
    for (const item of items) shown.current = advance(shown.current, item.publishedAt)
  }, [items])
  useEffect(() => {
    const commit = () => {
      if (shown.current) advanceReadMarker(shown.current.lastSeenPublishedAt)
    }
    window.addEventListener('pagehide', commit)
    return () => {
      window.removeEventListener('pagehide', commit)
      commit()
    }
  }, [])
  return marker
}

export function HomePage() {
  const { t, language, locale } = useText()
  useDocumentTitle(t('news.nav.home'))
  const [category, setCategory] = useState<Category>()
  const list = useInfiniteQuery(itemsQuery(language, category))
  const latest = useQuery(latestQuery)
  const items = list.data?.pages.flatMap((page) => page.items) ?? []
  const marker = useReadMarker(items)
  const edition = list.data?.pages[0]?.edition
  const newest = latest.data && 'publishedAt' in latest.data ? latest.data.publishedAt : undefined
  return (
    <>
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-accent">APPTHRUST NEWS</p>
        <h1 className="text-3xl leading-snug font-semibold tracking-tight text-stone-900">{t('news.home.title')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-500">{t('news.home.description')}</p>
      </div>
      <div role="group" aria-label={t('news.filter.label')} className="mb-6 flex flex-wrap gap-1.5 border-b border-line pb-5">
        {[undefined, ...CATEGORIES].map((value) => <button key={value ?? 'all'} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className={cn('min-h-9 rounded-full px-4 py-2 text-xs font-medium transition-colors', category === value ? 'bg-accent text-white' : 'text-stone-600 hover:bg-stone-100')}>
          {value ? t(`news.category.${value}`) : t('news.filter.all')}
        </button>)}
      </div>
      {list.isPending ? <Loading /> : null}
      {list.isError && !list.data ? <LoadFailed error={list.error} onRetry={() => void list.refetch()} /> : null}
      {list.data && items.length === 0 ? <EmptyState icon={<Newspaper />} title={t(edition?.itemCount === 0 ? 'news.home.empty.title' : 'news.home.noMatches.title')} body={t(edition?.itemCount === 0 ? 'news.home.empty.body' : 'news.home.noMatches.body')} /> : null}
      {items.length > 0 ? <ol className="space-y-3">
        {items.map((item) => <li key={item.id}>
          <article className={cn('group relative rounded-xl border bg-white transition-colors hover:border-accent-line', item.pinned ? 'border-accent-line' : 'border-line')}>
            <HrefLink href={paths.item(item.id)} className="block rounded-xl px-6 py-5 focus-visible:outline-offset-2">
              <ItemMeta item={item} unread={isUnread(marker, item.publishedAt)} />
              <div className="mt-3 flex items-start justify-between gap-4"><h2 lang={item.locale} className="text-base leading-relaxed font-semibold text-stone-900 group-hover:text-accent-strong">{item.title}</h2><ArrowRight aria-hidden className="mt-1 size-4 shrink-0 text-stone-300 group-hover:text-accent" /></div>
              <p lang={item.locale} className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-stone-500">{item.summary}</p>
            </HrefLink>
          </article>
        </li>)}
      </ol> : null}
      {list.isError && list.data ? <div className="mt-5"><LoadFailed error={list.error} onRetry={() => void (list.isFetchNextPageError ? list.fetchNextPage() : list.refetch())} /></div> : null}
      {list.hasNextPage ? <div className="mt-6 flex justify-center"><Button loading={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()}>{t('news.home.loadMore')}</Button></div> : null}
      {edition ? <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs leading-relaxed text-stone-400">
        <div className="flex flex-wrap gap-x-4 gap-y-1"><span>{t('news.footer.edition', { version: edition.version })}</span>{newest ? <span>{t('news.footer.latest', { date: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(newest)) })}<span className="sr-only"><NewsDate value={newest} /></span></span> : null}</div>
        <span>{t('news.footer.localReadState')}</span>
      </footer> : null}
      {latest.isError ? <div className="mt-5"><LoadFailed error={latest.error} onRetry={() => void latest.refetch()} /></div> : null}
    </>
  )
}
