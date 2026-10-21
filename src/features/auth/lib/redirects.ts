const DEFAULT_DESTINATION = '/dashboard'

export function safeNextPath(value: string | null | undefined): string {
  const candidate = value?.trim()

  if (!candidate) return DEFAULT_DESTINATION
  if (/[\u0000-\u001f\u007f]/.test(candidate)) return DEFAULT_DESTINATION
  if (candidate.includes('\\')) return DEFAULT_DESTINATION
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return DEFAULT_DESTINATION

  try {
    const parsed = new URL(candidate, 'http://internal.invalid')
    if (parsed.origin !== 'http://internal.invalid') return DEFAULT_DESTINATION
  } catch {
    return DEFAULT_DESTINATION
  }

  return candidate
}
