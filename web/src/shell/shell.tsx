import { AppSwitcher } from '@appthrust/app-launcher'
import { Languages, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { setLanguage, useText } from '../i18n'
import { paths } from '../routes/paths'
import { Button, HrefLink } from '../ui'

export function Shell({ children }: { children: ReactNode }) {
  const { t, language } = useText()
  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only z-50 rounded-md bg-white px-3 py-2 shadow focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        {t('news.nav.skipToMain')}
      </a>
      <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-5 sm:px-8">
          <HrefLink href={paths.home} className="flex shrink-0 items-center gap-2.5 text-[15px] font-semibold tracking-tight text-stone-900">
            <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-accent text-white"><Sparkles className="size-4" /></span>
            {t('news.product')}
          </HrefLink>
          <nav aria-label={t('news.nav.label')} className="hidden border-l border-line pl-5 sm:block">
            <HrefLink href={paths.home} className="text-sm text-stone-500 hover:text-accent" activeProps={{ className: 'text-accent-strong' }}>{t('news.nav.home')}</HrefLink>
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Button tone="ghost" size="sm" icon={<Languages />} aria-label={`${t('news.nav.language')}: ${t(language === 'ja' ? 'news.language.en' : 'news.language.ja')}`} onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}>
              <span lang={language === 'ja' ? 'en' : 'ja'} className="hidden sm:inline">{t(language === 'ja' ? 'news.language.en' : 'news.language.ja')}</span>
            </Button>
            <AppSwitcher language={language} />
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-5 py-10 focus:outline-none sm:px-8 sm:py-12">{children}</main>
    </div>
  )
}
