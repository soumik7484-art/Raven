/**
 * shareService.js — Public Report Sharing API Client
 *
 * Provides endpoints for creating, retrieving, and revoking
 * unguessable public share report snapshots.
 */

import { post, get, safeRequest } from './api'

export async function createShareReport(params) {
  const scanId = params?.scanId || params?.scan_id || (typeof params === 'string' ? params : null)
  const targetUrl = params?.targetUrl || params?.target_url || params?.url || null
  const reportData = params?.reportData || params?.report_data || (params && typeof params === 'object' && !params.scanId && !params.scan_id ? params : null)

  return safeRequest(() =>
    post('/share', {
      scan_id: scanId || null,
      target_url: targetUrl || null,
      report_data: reportData || null,
    })
  )
}

export async function getShareReport(shareId) {
  return safeRequest(() => get(`/share/${shareId}`))
}

export async function revokeShareReport(shareId) {
  return safeRequest(() => post(`/share/${shareId}/revoke`, {}))
}
