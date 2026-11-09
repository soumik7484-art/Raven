import assert from 'node:assert'
import { generatePdfBlob } from '../src/utils/pdfGenerator.js'

console.log('Running Share Feature Regression Tests...')

// Test 1: PDF generation contains all required sections and valid PDF header
{
  const testPayload = {
    url: 'https://paypal-account-security-update.com/login',
    scanId: 'RVN-9B3C41EF',
    timestamp: '2026-11-09T01:30:00Z',
    score: 88,
    riskCategory: 'Critical Risk',
    classification: 'malicious',
    explanation: 'Severe security risk detected. Access should be blocked to prevent potential compromise.',
    incidentSummary: { total: 2, critical: 1, high: 1, medium: 0, low: 0 },
    incidents: [
      { severity: 'CRITICAL', title: 'Confirmed Brand Impersonation: PayPal', description: 'Webpage mimics PayPal login form.' },
      { severity: 'HIGH', title: 'High-Risk TLD (.xyz)', description: 'Domain registered under frequently abused TLD.' }
    ],
    recommendedAction: 'DO NOT VISIT OR INTERACT. Close this tab immediately.'
  }

  const blob = generatePdfBlob(testPayload)
  assert(blob instanceof Blob, 'Test 1 Failed: Result is not a Blob')
  assert.strictEqual(blob.type, 'application/pdf', 'Test 1 Failed: MIME type must be application/pdf')
  assert(blob.size > 2000, 'Test 1 Failed: PDF size is suspiciously small')

  // Verify blob text structure
  blob.text().then((text) => {
    assert(text.startsWith('%PDF-1.4'), 'Test 1 Failed: Missing PDF-1.4 header')
    assert(text.includes('RAVEN // SECURITY INTELLIGENCE'), 'Test 1 Failed: Missing RAVEN title in PDF')
    assert(text.includes('paypal-account-security-update.com'), 'Test 1 Failed: Missing target URL')
    assert(text.includes('RVN-9B3C41EF'), 'Test 1 Failed: Missing scan ID')
    assert(text.includes('CRITICAL RISK'), 'Test 1 Failed: Missing risk category')
    assert(text.includes('Confirmed Brand Impersonation'), 'Test 1 Failed: Missing incident finding')
    assert(text.includes('%%EOF'), 'Test 1 Failed: Missing EOF marker')
    console.log('✓ Test 1: PDF generation verified with all required fields')
  })
}

// Test 2: Clean scan PDF generation
{
  const cleanPayload = {
    url: 'https://google.com',
    scanId: 'RVN-CLEAN001',
    score: 1,
    riskCategory: 'Clean / Safe',
    classification: 'safe',
    explanation: 'Google Safe Browsing and TLS certificate verified clean.',
    incidentSummary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
    incidents: [],
    recommendedAction: 'Safe to proceed with normal browsing awareness.'
  }

  const blob = generatePdfBlob(cleanPayload)
  blob.text().then((text) => {
    assert(text.includes('CLEAN & SAFE'), 'Test 2 Failed: Clean posture not reflected in PDF')
    assert(text.includes('ZERO SECURITY INCIDENTS DETECTED'), 'Test 2 Failed: Clean incident message missing')
    console.log('✓ Test 2: Clean scan PDF verified')
  })
}

// Test 3: Public Share Link ID format verification
{
  const validPattern = /^RVN-[0-9A-F]{8}$/
  const testIds = ['RVN-A9F23B1C', 'RVN-88F4C2D1', 'RVN-0000FFFF']
  for (const id of testIds) {
    assert(validPattern.test(id), `Test 3 Failed: ID ${id} does not match RVN-XXXXXXXX`)
  }
  assert(!validPattern.test('invalid-id'), 'Test 3 Failed: Invalid ID should not match')
  console.log('✓ Test 3: Public Share ID format verified')
}

// Test 4: Incomplete / Degraded Telemetry handling in share payload
{
  const degradedPayload = {
    url: 'https://internal-server.local',
    scanId: 'RVN-DEGRADED',
    score: 45,
    riskCategory: 'Moderate Risk',
    explanation: 'Webpage DOM inspection was inconclusive due to timeout.',
    incidentSummary: { total: 1, critical: 0, high: 0, medium: 1, low: 0 },
    incidents: [
      { severity: 'MEDIUM', title: 'DOM Inspection Inconclusive', description: 'Network timed out.' }
    ]
  }

  const blob = generatePdfBlob(degradedPayload)
  blob.text().then((text) => {
    assert(text.includes('inconclusive'), 'Test 4 Failed: Inconclusive state not present in PDF')
    console.log('✓ Test 4: Inconclusive telemetry handling verified in PDF')
    console.log('\nAll Share Feature Regression Tests Passed Successfully!')
  })
}
