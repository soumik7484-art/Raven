import assert from 'node:assert'
import { extractIncidents } from '../src/utils/incidentNormalizer.js'

console.log('Running Incident Normalizer Regression Tests...')

// Test 1: Google-looking subdomain
{
  const payload = {
    submitted_url: 'https://google.com.security-verification.xyz/login',
    domain: 'google.com.security-verification.xyz',
    domain_intelligence: {
      hostname: 'google.com.security-verification.xyz',
      ssl_report: { is_valid: true, tls_outcome: 'VALID_CERTIFICATE' },
      risk_indicators: [
        "Potential brand impersonation: 'google' referenced in non-official domain 'google.com.security-verification.xyz'",
        'Deceptive phishing keyword tokens detected: login, security, verification',
        'Domain registered under frequently abused TLD (.xyz)'
      ]
    },
    threat_intelligence: {
      is_threat_confirmed: false,
      threat_types: [],
      providers_checked: 3,
      providers_malicious_count: 0,
      provider_results: {}
    },
    website_assessment: {
      is_accessible: true,
      content_inspection_state: 'COMPLETED',
      dom_inspection_available: true,
      brand_impersonation: {
        is_impersonation_detected: true,
        verification_type: 'potential_hostname_similarity',
        target_brand: 'google'
      }
    }
  }

  const result = extractIncidents(payload)
  const brandInc = result.incidents.find((i) => i.id === 'brand-impersonation-potential')
  assert(brandInc, 'Test 1 Failed: Brand impersonation finding missing from incidents')
  assert.strictEqual(brandInc.title, 'Potential Brand Impersonation: google')
  assert.strictEqual(brandInc.severity, 'HIGH')
  assert.strictEqual(brandInc.status, 'SUSPICIOUS')
  assert.strictEqual(result.summary.total, result.incidents.length, 'Total counter must match incidents array')
  assert(result.summary.high >= 1, 'High counter must be >= 1')
  console.log('✓ Test 1: Google-looking subdomain passed')
}

// Test 2: Genuine Google domain
{
  const payload = {
    submitted_url: 'https://accounts.google.com/signin',
    domain: 'accounts.google.com',
    domain_intelligence: {
      hostname: 'accounts.google.com',
      ssl_report: { is_valid: true, tls_outcome: 'VALID_CERTIFICATE' },
      risk_indicators: []
    },
    threat_intelligence: {
      is_threat_confirmed: false,
      threat_types: [],
      providers_checked: 3,
      providers_malicious_count: 0,
      provider_results: {}
    },
    website_assessment: {
      is_accessible: true,
      content_inspection_state: 'COMPLETED',
      dom_inspection_available: true,
      brand_impersonation: {
        is_impersonation_detected: false
      }
    }
  }

  const result = extractIncidents(payload)
  const brandInc = result.incidents.find((i) => i.id.includes('brand-impersonation'))
  assert.strictEqual(brandInc, undefined, 'Test 2 Failed: Genuine Google domain should have 0 brand impersonation incidents')
  assert.strictEqual(result.summary.total, 0)
  assert.strictEqual(result.summary.critical, 0)
  assert.strictEqual(result.summary.high, 0)
  console.log('✓ Test 2: Genuine Google domain passed')
}

// Test 3: Unicode homograph domain
{
  const payload = {
    submitted_url: 'https://xn--ggle-55da.com/login',
    domain: 'xn--ggle-55da.com',
    domain_intelligence: {
      hostname: 'xn--ggle-55da.com',
      ssl_report: { is_valid: true, tls_outcome: 'VALID_CERTIFICATE' },
      risk_indicators: [
        'Punycode (IDN) detected; possible homograph spoofing attempt',
        "Potential brand impersonation: 'google' referenced in non-official domain 'xn--ggle-55da.com'"
      ]
    },
    threat_intelligence: {
      is_threat_confirmed: false,
      threat_types: [],
      providers_checked: 3,
      providers_malicious_count: 0
    },
    website_assessment: {
      is_accessible: true,
      content_inspection_state: 'COMPLETED',
      dom_inspection_available: true,
      brand_impersonation: {
        is_impersonation_detected: true,
        verification_type: 'potential_hostname_similarity',
        target_brand: 'google'
      }
    }
  }

  const result = extractIncidents(payload)
  const homographInc = result.incidents.find((i) => i.id === 'domain-punycode-homograph')
  assert(homographInc, 'Test 3 Failed: Homograph incident missing')
  assert.strictEqual(homographInc.title, 'Unicode Homograph / Punycode Deception')
  assert.strictEqual(homographInc.severity, 'HIGH')
  const brandInc = result.incidents.find((i) => i.id === 'brand-impersonation-potential')
  assert(brandInc, 'Test 3 Failed: Brand impersonation finding missing')
  assert.strictEqual(result.summary.total, result.incidents.length)
  console.log('✓ Test 3: Unicode homograph domain passed')
}

// Test 4: DOM inspection timeout
{
  const payload = {
    submitted_url: 'https://google.com.security-verification.xyz/login',
    domain: 'google.com.security-verification.xyz',
    domain_intelligence: {
      hostname: 'google.com.security-verification.xyz',
      ssl_report: { is_valid: true, tls_outcome: 'VALID_CERTIFICATE' },
      risk_indicators: [
        "Potential brand impersonation: 'google' referenced in non-official domain 'google.com.security-verification.xyz'"
      ]
    },
    threat_intelligence: {
      is_threat_confirmed: false,
      threat_types: [],
      providers_checked: 3,
      providers_malicious_count: 0
    },
    website_assessment: {
      is_accessible: false,
      content_inspection_state: 'INCONCLUSIVE',
      dom_inspection_available: false,
      inspection_state: 'timeout',
      fetch_error: 'Connection timed out during DOM inspection',
      brand_impersonation: {
        is_impersonation_detected: true,
        verification_type: 'potential_hostname_similarity',
        target_brand: 'google'
      }
    }
  }

  const result = extractIncidents(payload)
  assert(result.isIncomplete, 'Test 4 Failed: Should be marked as incomplete / missing telemetry')
  assert(result.missingChecks.some((c) => c.includes('DOM') && c.includes('inconclusive')), 'Test 4 Failed: DOM missingCheck entry missing')
  // Brand finding must NOT be excluded or suppressed
  const brandInc = result.incidents.find((i) => i.id === 'brand-impersonation-potential')
  assert(brandInc, 'Test 4 Failed: Brand impersonation finding must not be dropped when DOM times out')
  assert(brandInc.description.includes('inconclusive'), 'Description should mention inconclusive DOM verification')
  console.log('✓ Test 4: DOM inspection timeout passed')
}

// Test 5: Clean threat intelligence with suspicious hostname
{
  const payload = {
    submitted_url: 'https://google.com.security-verification.xyz/login',
    domain: 'google.com.security-verification.xyz',
    domain_intelligence: {
      hostname: 'google.com.security-verification.xyz',
      ssl_report: { is_valid: true, tls_outcome: 'VALID_CERTIFICATE' },
      risk_indicators: [
        "Potential brand impersonation: 'google' referenced in non-official domain 'google.com.security-verification.xyz'",
        'Deceptive phishing keyword tokens detected: login, security, verification'
      ]
    },
    threat_intelligence: {
      is_threat_confirmed: false,
      threat_types: [],
      providers_checked: 3,
      providers_malicious_count: 0,
      provider_results: {
        google_safe_browsing: { is_malicious: false, status: 'clean' },
        virustotal: { is_malicious: false, malicious_count: 0 },
        urlhaus: { is_malicious: false, status: 'clean' }
      }
    },
    website_assessment: {
      is_accessible: true,
      content_inspection_state: 'COMPLETED',
      dom_inspection_available: true,
      brand_impersonation: {
        is_impersonation_detected: true,
        verification_type: 'potential_hostname_similarity',
        target_brand: 'google'
      }
    }
  }

  const result = extractIncidents(payload)
  // Threat intel must be clean and NOT generate ti-malicious-confirmed
  const tiInc = result.incidents.find((i) => i.id === 'ti-malicious-confirmed')
  assert.strictEqual(tiInc, undefined, 'Test 5 Failed: Clean threat feeds must not generate a confirmed threat incident')
  // But brand impersonation and domain tokens must still be present
  assert(result.incidents.some((i) => i.id === 'brand-impersonation-potential'))
  assert(result.incidents.some((i) => i.id === 'domain-phishing-tokens'))
  assert.strictEqual(result.summary.critical, 0)
  assert.strictEqual(result.summary.high, 1)
  console.log('✓ Test 5: Clean threat intelligence with suspicious hostname passed')
}

// Test 6: Confirmed brand impersonation with corresponding incident count
{
  const payload = {
    submitted_url: 'https://google.com.security-verification.xyz/login',
    domain: 'google.com.security-verification.xyz',
    domain_intelligence: {
      hostname: 'google.com.security-verification.xyz',
      ssl_report: { is_valid: true, tls_outcome: 'VALID_CERTIFICATE' },
      risk_indicators: [
        "Potential brand impersonation: 'google' referenced in non-official domain 'google.com.security-verification.xyz'"
      ]
    },
    threat_intelligence: {
      is_threat_confirmed: false,
      threat_types: [],
      providers_checked: 3,
      providers_malicious_count: 0
    },
    website_assessment: {
      is_accessible: true,
      content_inspection_state: 'COMPLETED',
      dom_inspection_available: true,
      brand_impersonation: {
        is_impersonation_detected: true,
        verification_type: 'confirmed_webpage_spoof',
        target_brand: 'google',
        dom_verification: 'confirmed'
      }
    }
  }

  const result = extractIncidents(payload)
  const brandInc = result.incidents.find((i) => i.id === 'brand-impersonation-confirmed')
  assert(brandInc, 'Test 6 Failed: Confirmed brand impersonation incident missing')
  assert.strictEqual(brandInc.title, 'Confirmed Brand Impersonation: google')
  assert.strictEqual(brandInc.severity, 'CRITICAL')
  assert.strictEqual(brandInc.status, 'CONFIRMED')
  assert.strictEqual(result.summary.critical, 1)
  assert.strictEqual(result.summary.total, result.incidents.length)
  console.log('✓ Test 6: Confirmed brand impersonation with corresponding incident count passed')
}

console.log('\nAll 6 Incident Normalizer Regression Tests Passed Successfully!')
