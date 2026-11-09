import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { isNewsError } from '../../api/news'
import { itemQuery } from '../../api/queries'
import { useText } from '../../i18n'
import { NotFound } from '../../routes/root'
import { paths } from '../../routes/paths'
import { HrefLink, Loading, LoadFailed, Markdown, Notice, useDocumentTitle } from '../../ui'
import { ItemMeta } from './item-meta'

export function ItemPage({ id }: { id: string }) {
  const { t, language, locale } = useText()
  const query = useQuery(itemQuery(id, language))
  const item = query.data
  useDocumentTitle(item?.title ?? t('news.nav.home'))
  if (query.isPending) return <Loading />
  if (isNewsError(query.error, 'not_found')) return <NotFound />
  if (query.isError) return <LoadFailed error={query.error} onRetry={() => void query.refetch()} />
  if (!item) return <Loading />
  return (
    <div className="mx-auto max-w-3xl">
      <HrefLink href={paths.home} className="mb-8 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-accent"><ArrowLeft aria-hidden className="size-4" />{t('news.item.back')}</HrefLink>
      <article>
        <header className="mb-8 border-b border-line pb-8">
          <ItemMeta item={item} />
          <h1 lang={item.locale} className="mt-5 text-3xl leading-[1.5] font-semibold tracking-tight text-stone-900">{item.title}</h1>
          <p lang={item.locale} className="mt-4 text-base leading-relaxed text-stone-500">{item.summary}</p>
          {item.updatedAt ? <p role="note" className="mt-4 text-xs text-stone-500">{t('news.item.corrected', { date: new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date(item.updatedAt)) })}</p> : null}
        </header>
        {item.locale !== language ? <Notice role="note" className="mb-6">{t('news.item.fallback')}</Notice> : null}
        <div lang={item.locale}><Markdown source={item.markdown} /></div>
        {item.tags.length ? <ul className="mt-10 flex flex-wrap gap-2 border-t border-line pt-5">{item.tags.map((tag) => <li key={tag} className="rounded bg-stone-100 px-2 py-1 text-xs text-stone-500">{tag}</li>)}</ul> : null}
      </article>
    </div>
  )
}
