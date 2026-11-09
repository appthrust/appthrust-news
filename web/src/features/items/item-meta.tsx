import { Pin } from 'lucide-react'
import type { Category, ItemSummary } from '../../api/news'
import { useText } from '../../i18n'

export const CATEGORIES: readonly Category[] = ['announcement', 'release', 'feature', 'maintenance', 'incident', 'event']

export function NewsDate({ value }: { value: string }) {
  const { locale } = useText()
  return <time dateTime={value}>{new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))}</time>
}

export function CategoryLabel({ category }: { category: Category }) {
  const { t } = useText()
  return <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">{t(`news.category.${category}`)}</span>
}

export function ItemMeta({ item, unread = false }: { item: ItemSummary; unread?: boolean }) {
  const { t } = useText()
  return <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-stone-500">
    <CategoryLabel category={item.category} />
    <NewsDate value={item.publishedAt} />
    {item.pinned ? <span className="inline-flex items-center gap-1 text-accent-strong"><Pin aria-hidden className="size-3" />{t('news.item.pinned')}</span> : null}
    {unread ? <span className="inline-flex items-center gap-1.5 font-medium text-accent"><span aria-hidden className="size-1.5 rounded-full bg-accent" />{t('news.item.unread')}</span> : null}
  </div>
}
