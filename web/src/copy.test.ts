import { createDashboardTranslator } from '@appthrust/platform-dashboard-i18n'
import { describe, expect, test } from 'bun:test'
import { catalogs } from './copy'

const placeholders = (text: string) => [...text.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((match) => match[1]).sort()

describe('news chrome translations', () => {
  const messages = catalogs.flatMap((catalog) => Object.entries(catalog))
  test('all copy has unique namespaced ids and matching Japanese placeholders', () => {
    expect(new Set(messages.map(([id]) => id)).size).toBe(messages.length)
    for (const [id, message] of messages) {
      expect(id.startsWith('news.')).toBe(true)
      expect(message.translations.ja, id).toBeTruthy()
      expect(placeholders(message.translations.ja ?? ''), id).toEqual(placeholders(message.defaultMessage))
    }
  })
  test('category labels and edition information are translated', () => {
    const ja = createDashboardTranslator('ja', catalogs)
    const en = createDashboardTranslator('en', catalogs)
    expect(ja.t('news.category.announcement')).toBe('お知らせ')
    expect(ja.t('news.category.release')).toBe('リリース')
    expect(ja.t('news.category.feature')).toBe('新機能')
    expect(ja.t('news.category.maintenance')).toBe('メンテナンス')
    expect(ja.t('news.category.incident')).toBe('障害')
    expect(ja.t('news.category.event')).toBe('イベント')
    expect(en.t('news.footer.edition', { version: '1.0.0' })).toBe('Edition 1.0.0')
  })
})
