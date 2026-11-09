import { advance, parse, type ReadMarker } from './read-marker'

export const READ_MARKER_KEY = 'appthrust-news:last-seen'

export function readMarker(): ReadMarker | undefined {
  try {
    return parse(localStorage.getItem(READ_MARKER_KEY))
  } catch {
    return undefined
  }
}

export function advanceReadMarker(publishedAt: string): void {
  try {
    // Read again at write time so another tab's newer marker is preserved.
    const marker = advance(readMarker(), publishedAt)
    if (marker) localStorage.setItem(READ_MARKER_KEY, JSON.stringify(marker))
  } catch {
    // Private browsing and storage exhaustion must never block reading news.
  }
}
