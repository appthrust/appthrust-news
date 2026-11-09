export const COPIED_MS = 2000

/** A denied clipboard permission is visible feedback, never an exception. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
