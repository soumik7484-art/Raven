/**
 * shareService.js — Public Report Sharing API Client
 *
 * Provides endpoints for creating, retrieving, and revoking
 * unguessable public share report snapshots.
 */

import { post, get, safeRequest } from './api'

export async function createShareReport({ scanId, targetUrl, reportData }) {
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
