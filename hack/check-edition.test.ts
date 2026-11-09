import { describe, expect, test } from 'bun:test'
import { compareEditions, parseEditionItem, selectBaseTag, type Edition, type EditionItem } from './edition'

const id = '2026-11-10-welcome'
const publishedAt = '2026-11-10T09:00:00+09:00'
const updatedAt = '2026-11-11T09:00:00+09:00'
const later = '2026-11-12T09:00:00+09:00'
const ja: EditionItem = { title: 'AppThrust からのお知らせ', publishedAt, body: '本文。\n' }
const en: EditionItem = { title: 'News from AppThrust', publishedAt, body: 'The announcement.\n' }
const edition = (item: EditionItem = ja): Edition => ({ [id]: { ja: item } })

function changed(changes: Partial<EditionItem>): Edition {
  return edition({ ...ja, ...changes })
}

describe('selectBaseTag', () => {
  test('selects the latest reachable release from the git-ordered tags', () => {
    expect(selectBaseTag(['v1.10.0', 'v1.2.0', 'v1.0.0'])).toBe('v1.10.0')
  })

  test('excludes the current tag so a publication checks the earlier edition', () => {
    expect(selectBaseTag(['v1.1.0', 'v1.0.0'], 'v1.1.0')).toBe('v1.0.0')
  })

  test('has no base edition when there are no earlier reachable tags', () => {
    expect(selectBaseTag([])).toBeUndefined()
    expect(selectBaseTag(['v1.0.0'], 'v1.0.0')).toBeUndefined()
    expect(compareEditions(undefined, edition())).toEqual([])
  })
})

describe('compareEditions', () => {
  test('allows unchanged content and new items without mutating either edition', () => {
    const base = edition()
    const head: Edition = { ...base, '2026-11-12-release': { ja: { ...ja, title: 'New release', publishedAt: later } } }
    const before = structuredClone({ base, head })
    expect(compareEditions(base, head)).toEqual([])
    expect({ base, head }).toEqual(before)
  })

  test('rejects removal or renaming of an existing item directory', () => {
    expect(compareEditions(edition(), {})).toEqual([`content/news/${id}/: published item was removed`])
    expect(compareEditions(edition(), { '2026-11-10-renamed': { ja } })).toEqual([`content/news/${id}/: published item was removed`])
  })

  test('checks every existing locale for immutable publishedAt, even on a correction', () => {
    const base = { [id]: { ja, en } }
    const head = { [id]: { ja: { ...ja, publishedAt: updatedAt, updatedAt: later }, en: { ...en, publishedAt: updatedAt } } }
    expect(compareEditions(base, head)).toEqual([
      `content/news/${id}/ja.md: publishedAt changed from ${publishedAt} to ${updatedAt}`,
      `content/news/${id}/en.md: publishedAt changed from ${publishedAt} to ${updatedAt}`,
    ])
  })

  test('keeps the original publishedAt spelling even for equivalent UTC offsets', () => {
    expect(compareEditions(edition(), changed({ publishedAt: '2026-11-10T00:00:00Z' }))[0]).toContain('publishedAt changed')
  })

  for (const changes of [{ title: '訂正後のタイトル' }, { body: '訂正後の本文。\n' }]) {
    test(`requires a correction timestamp when ${Object.keys(changes)[0]} changes`, () => {
      expect(compareEditions(edition(), changed(changes))).toEqual([
        `content/news/${id}/ja.md: body or title changed without updatedAt set at or after ${publishedAt}`,
      ])
      expect(compareEditions(edition(), changed({ ...changes, updatedAt }))).toEqual([])
    })
  }

  test('allows the first correction timestamp to be set at publication, but not before it', () => {
    expect(compareEditions(edition(), changed({ body: 'Correction', updatedAt: publishedAt }))).toEqual([])
    expect(compareEditions(edition(), changed({ body: 'Correction', updatedAt: '2026-11-09T00:00:00Z' }))).toHaveLength(1)
  })

  test('requires an existing correction timestamp to advance, not disappear or go backwards', () => {
    const base = edition({ ...ja, updatedAt })
    for (const invalid of [undefined, publishedAt, updatedAt, '2026-11-11T00:00:00Z', 'invalid']) {
      expect(compareEditions(base, changed({ body: 'Another correction', updatedAt: invalid }))).toEqual([
        `content/news/${id}/ja.md: body or title changed without updatedAt advanced after ${updatedAt}`,
      ])
    }
    expect(compareEditions(base, changed({ body: 'Another correction', updatedAt: later }))).toEqual([])
  })

  test('recognizes nanosecond advancement instead of truncating to JavaScript milliseconds', () => {
    const base = edition({ ...ja, updatedAt: '2026-11-11T00:00:00.000000001Z' })
    expect(compareEditions(base, changed({ body: 'Correction', updatedAt: '2026-11-11T00:00:00.000000002Z' }))).toEqual([])
  })

  test('a correction timestamp in one locale does not license another locale rewrite', () => {
    const base = { [id]: { ja, en } }
    const head = { [id]: { ja: { ...ja, updatedAt }, en: { ...en, body: 'Changed English body' } } }
    expect(compareEditions(base, head)).toEqual([
      `content/news/${id}/en.md: body or title changed without updatedAt set at or after ${publishedAt}`,
    ])
  })

  test('always rejects removal of a published locale, even when the remaining locale advances updatedAt', () => {
    const base = { [id]: { ja, en } }
    expect(compareEditions(base, changed({ updatedAt }))).toEqual([`content/news/${id}/en.md: published locale was removed`])
    expect(compareEditions(base, { [id]: { en: { ...en, updatedAt } } })).toEqual([`content/news/${id}/ja.md: published locale was removed`])
  })

  test('allows adding a translation without updatedAt only with the original publishedAt', () => {
    expect(compareEditions(edition(), { [id]: { ja, en } })).toEqual([])
    expect(compareEditions(edition(), { [id]: { ja, en: { ...en, publishedAt: updatedAt } } })).toEqual([
      `content/news/${id}/en.md: publishedAt changed from ${publishedAt} to ${updatedAt}`,
    ])
  })

  test('reports every violation across items and fields instead of stopping at the first', () => {
    const base = { ...edition(), '2026-11-11-second': { ja, en } }
    const head = { [id]: { ja: { ...ja, title: 'Silent rewrite', publishedAt: later } } }
    const violations = compareEditions(base, head)
    expect(violations).toHaveLength(3)
    expect(violations[0]).toContain('publishedAt changed')
    expect(violations[1]).toContain('body or title changed')
    expect(violations[2]).toContain('2026-11-11-second/: published item was removed')
  })
})

describe('parseEditionItem', () => {
  test('extracts comparison fields and preserves the body', () => {
    expect(parseEditionItem(`---\ntitle: News\nsummary: Summary\npublishedAt: ${publishedAt}\nupdatedAt:\ncategory: announcement\n---\n# Body\n`, 'ja.md'))
      .toEqual({ title: 'News', publishedAt, updatedAt: undefined, body: '# Body\n' })
  })

  test('reads CRLF frontmatter and a correction timestamp', () => {
    expect(parseEditionItem(`---\r\ntitle: News\r\npublishedAt: ${publishedAt}\r\nupdatedAt: ${updatedAt}\r\n---\r\nBody\r\n`, 'en.md'))
      .toEqual({ title: 'News', publishedAt, updatedAt, body: 'Body\r\n' })
  })

  test('reports malformed comparison fields with the source path', () => {
    expect(() => parseEditionItem('No frontmatter', 'ja.md')).toThrow('ja.md: missing YAML frontmatter')
    expect(() => parseEditionItem('---\nsummary: News\n---\n', 'ja.md')).toThrow('ja.md: title is required')
    expect(() => parseEditionItem('---\ntitle: News\npublishedAt: yesterday\n---\n', 'ja.md')).toThrow('ja.md: publishedAt must be RFC 3339')
    expect(() => parseEditionItem(`---\ntitle: News\npublishedAt: ${publishedAt}\nupdatedAt: false\n---\n`, 'en.md')).toThrow('en.md: updatedAt must be RFC 3339 when set')
  })
})
