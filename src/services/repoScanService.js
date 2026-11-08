/**
 * RepoScanService — GitHub Repository Security Health Check API Client
 */

import { get, post, safeRequest } from './api'

export async function checkScannerHealth() {
  return safeRequest(() => get('/v1/github/health'))
}

export async function fetchUserRepos(username) {
  return safeRequest(() => get(`/v1/github/repositories/${encodeURIComponent(username)}`))
}

export async function startRepoScan(repositoryUrl) {
  return safeRequest(() => post('/v1/github/scan', { repository_url: repositoryUrl }))
}

export async function getRepoScanStatus(scanId) {
  return safeRequest(() => get(`/v1/github/scan/${scanId}`))
}

export async function getRepoScanReport(scanId) {
  return safeRequest(() => get(`/v1/github/scan/${scanId}/report`))
}
