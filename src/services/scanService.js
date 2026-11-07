/**
 * Scan service — Website security investigation
 * POST /api/scan        → Start investigation
 * GET  /api/scan/{id}   → Get investigation results
 */

import { post, get, safeRequest } from './api'

export async function startScan(url) {
  return safeRequest(() => post('/scan', { url }))
}

export async function getScanResult(scanId) {
  return safeRequest(() => get(`/scan/${scanId}`))
}
