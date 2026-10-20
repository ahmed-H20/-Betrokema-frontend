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

  // Ensure leading slash for relative paths (e.g. uploads/products/abc.png -> /uploads/products/abc.png)
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`
  }

  return trimmed
}
