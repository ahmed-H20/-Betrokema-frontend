/**
 * Resolves an image URL/path to a displayable source.
 * Handles absolute URLs, relative /uploads paths, data URLs, and blobs.
 */
export function resolveImageUrl(urlOrPath?: string | null): string {
  if (!urlOrPath) return ''
  const trimmed = urlOrPath.trim()
  if (!trimmed) return ''

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }

  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`
  }

  return trimmed
}

export const DEFAULT_AVATAR = '/default-avatar.jpg'

export function resolveAvatarUrl(urlOrPath?: string | null): string {
  if (!urlOrPath || !urlOrPath.trim()) return DEFAULT_AVATAR
  return resolveImageUrl(urlOrPath)
}
