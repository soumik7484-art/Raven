/**
 * URL validation utilities
 */

/**
 * Validates whether a string is a properly formatted URL
 * @param {string} url - The URL string to validate
 * @returns {{ valid: boolean, normalized: string|null, error: string|null }}
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, normalized: null, error: 'Please enter a URL.' }
  }

  const trimmed = url.trim()

  if (trimmed.length === 0) {
    return { valid: false, normalized: null, error: 'Please enter a URL.' }
  }

  // Add https:// if no protocol is specified
  let normalized = trimmed
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized
  }

  try {
    const parsed = new URL(normalized)

    // Must have a valid hostname
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { valid: false, normalized: null, error: 'Please enter a valid website address.' }
    }

    // Must have a dot in the hostname (e.g., example.com)
    if (!parsed.hostname.includes('.')) {
      return { valid: false, normalized: null, error: 'Please enter a complete domain (e.g., example.com).' }
    }

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, normalized: null, error: 'Only HTTP and HTTPS URLs are supported.' }
    }

    return { valid: true, normalized: parsed.href, error: null }
  } catch {
    return { valid: false, normalized: null, error: 'Please enter a valid URL (e.g., https://example.com).' }
  }
}
