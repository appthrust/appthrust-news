export type ReadMarker = { lastSeenPublishedAt: string }

function timestamp(value: unknown): number | undefined {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return undefined
  const time = Date.parse(value)
  return Number.isFinite(time) ? time : undefined
}

/** Untrusted browser storage degrades to everything unread. */
export function parse(raw: string | null | undefined): ReadMarker | undefined {
  if (!raw) return undefined
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null || !('lastSeenPublishedAt' in value)) return undefined
    const date = value.lastSeenPublishedAt
    return timestamp(date) === undefined ? undefined : { lastSeenPublishedAt: date as string }
  } catch {
    return undefined
  }
}

export function isUnread(marker: ReadMarker | undefined, publishedAt: string): boolean {
  const seen = timestamp(marker?.lastSeenPublishedAt)
  return seen === undefined || (timestamp(publishedAt) ?? -Infinity) > seen
}

/** Compare instants, not strings: RFC 3339 offsets need not match. */
export function advance(marker: ReadMarker | undefined, publishedAt: string): ReadMarker | undefined {
  const next = timestamp(publishedAt)
  if (next === undefined) return marker
  const seen = timestamp(marker?.lastSeenPublishedAt)
  return seen === undefined || next > seen ? { lastSeenPublishedAt: publishedAt } : marker
}
