import { YAML } from 'bun'

export interface EditionItem {
  title: string
  publishedAt: string
  updatedAt?: string
  body: string
}

export type Edition = Readonly<Record<string, Readonly<Partial<Record<'ja' | 'en', EditionItem>>>>>

/** Git supplies reachable v* tags in descending version order. */
export function selectBaseTag(tags: readonly string[], excludedTag?: string): string | undefined {
  return tags.find(tag => tag.startsWith('v') && tag !== excludedTag)
}

// Match Go's RFC 3339 nanosecond precision, including equivalent UTC offsets.
function timestamp(value: string): bigint | undefined {
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/.exec(value)
  if (!match) return undefined
  const milliseconds = Date.parse(`${match[1]}${match[3]}`)
  if (!Number.isFinite(milliseconds)) return undefined
  return BigInt(milliseconds) * 1_000_000n + BigInt((match[2] ?? '').padEnd(9, '0').slice(0, 9))
}

/** Only the fields needed for edition comparisons; the server validates the full schema. */
export function parseEditionItem(markdown: string, path: string): EditionItem {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(markdown)
  if (!match) throw new Error(`${path}: missing YAML frontmatter`)
  const metadata = YAML.parse(match[1]!) as Record<string, unknown> | null
  if (!metadata || typeof metadata.title !== 'string' || !metadata.title.trim()) {
    throw new Error(`${path}: title is required`)
  }
  if (typeof metadata.publishedAt !== 'string' || timestamp(metadata.publishedAt) === undefined) {
    throw new Error(`${path}: publishedAt must be RFC 3339`)
  }
  const updatedAt = metadata.updatedAt ?? undefined
  if (updatedAt !== undefined && (typeof updatedAt !== 'string' || timestamp(updatedAt) === undefined)) {
    throw new Error(`${path}: updatedAt must be RFC 3339 when set`)
  }
  return { title: metadata.title, publishedAt: metadata.publishedAt, updatedAt, body: match[2]! }
}

/** No base edition is the first release, which has no append-only constraints. */
export function compareEditions(base: Edition | undefined, head: Edition): string[] {
  if (!base) return []
  const violations: string[] = []
  for (const id of Object.keys(base).sort()) {
    const previous = base[id]!
    const current = head[id]
    const directory = `content/news/${id}`
    if (!Object.hasOwn(head, id)) {
      violations.push(`${directory}/: published item was removed`)
      continue
    }
    const original = previous.ja ?? previous.en
    for (const locale of ['ja', 'en'] as const) {
      const before = previous[locale]
      const after = current?.[locale]
      const path = `${directory}/${locale}.md`
      if (before && !after) {
        violations.push(`${path}: published locale was removed`)
        continue
      }
      if (!after) continue
      const publishedAt = before?.publishedAt ?? original?.publishedAt
      if (publishedAt !== undefined && after.publishedAt !== publishedAt) {
        violations.push(`${path}: publishedAt changed from ${publishedAt} to ${after.publishedAt}`)
      }
      // A new translation adds content; it does not correct an existing locale.
      if (!before || (before.title === after.title && before.body === after.body)) continue
      const baseline = before.updatedAt ?? before.publishedAt
      const updated = after.updatedAt === undefined ? undefined : timestamp(after.updatedAt)
      const previousUpdate = timestamp(baseline)
      if (updated === undefined || previousUpdate === undefined ||
        (before.updatedAt === undefined ? updated < previousUpdate : updated <= previousUpdate)) {
        const requirement = before.updatedAt === undefined ? 'set at or after' : 'advanced after'
        violations.push(`${path}: body or title changed without updatedAt ${requirement} ${baseline}`)
      }
    }
  }
  return violations
}
