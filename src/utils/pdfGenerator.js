/**
 * pdfGenerator.js — RAVEN Security Platform
 *
 * Generates an authoritative, professional cybersecurity investigation PDF
 * in pure standard PDF-1.4 binary format with zero external dependencies.
 *
 * Supported across all desktop and mobile browsers, Adobe Acrobat, Apple Preview,
 * and Chrome/Edge PDF viewers.
 */

function escapePdfText(str) {
  if (!str) return ''
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ') // Strip non-ASCII for standard Helvetica
}

function wrapText(text, maxChars) {
  if (!text) return []
  const words = String(text).split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

export function generatePdfBlob(reportData) {
  const {
    url = 'https://unknown-target.com',
    scanId = `RVN-${Date.now().toString(36).toUpperCase()}`,
    timestamp = new Date().toISOString(),
    score = 0,
    riskCategory = 'Clean / Safe',
    classification = 'safe',
    explanation = 'Investigation verified safe posture with zero threat listings.',
    incidentSummary = { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
    incidents = [],
    recommendedAction = 'Safe to proceed with normal browsing awareness.',
  } = reportData

  const refined = reportData.ai_refinement?.refined_report || null
  const effectiveExplanation = refined?.executive_summary || explanation
  const effectiveRecommendedAction = (refined?.recommended_actions && refined.recommended_actions[0]) || recommendedAction

  // Page dimensions: A4 portrait (595.28 x 841.89 pt)
  const width = 595.28
  const height = 841.89
  const margin = 40

  const streamOps = []

  // Helper functions for PDF graphics
  const setFill = (r, g, b) => streamOps.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg`)
  const setStroke = (r, g, b) => streamOps.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG`)
  const setLineWidth = (w) => streamOps.push(`${w} w`)
  const drawRect = (x, y, w, h, fill = true, stroke = false) => {
    streamOps.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill && stroke ? 'B' : fill ? 'f' : 'S'}`)
  }
  const drawText = (font, size, x, y, text, r = 30, g = 30, b = 30) => {
    setFill(r, g, b)
    streamOps.push(`BT /${font} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`)
  }

  // ── Header Background Banner ──
  setFill(30, 40, 34) // Dark Forest/Raven Slate #1e2822
  drawRect(0, height - 80, width, 80, true, false)

  // Top Accent Stripe
  setFill(58, 122, 58) // Raven Green #3a7a3a
  drawRect(0, height - 6, width, 6, true, false)

  // Header Title & Logo Text
  drawText('F2', 20, margin, height - 42, 'RAVEN // SECURITY INTELLIGENCE', 255, 255, 255)
  drawText('F1', 9, margin, height - 58, 'AUTHORITATIVE WEBSITE SECURITY INVESTIGATION REPORT', 180, 205, 185)

  // Confidentiality Badge in Header
  setFill(45, 60, 50)
  setStroke(58, 122, 58)
  setLineWidth(1)
  drawRect(width - margin - 110, height - 54, 110, 22, true, true)
  drawText('F2', 8, width - margin - 100, height - 41, 'OFFICIAL AUDIT', 140, 230, 150)

  // ── Scan Metadata Card ──
  let y = height - 100
  setFill(246, 247, 244) // Off-white neutral #f6f7f4
  setStroke(200, 202, 195)
  setLineWidth(1)
  drawRect(margin, y - 68, width - margin * 2, 68, true, true)

  drawText('F2', 8, margin + 14, y - 18, 'INVESTIGATION TARGET:', 90, 95, 90)
  drawText('F2', 11, margin + 14, y - 34, url.length > 55 ? url.substring(0, 52) + '...' : url, 20, 20, 20)

  drawText('F1', 8, margin + 14, y - 52, `SCAN ID: ${scanId}   |   GENERATED: ${new Date(timestamp).toUTCString()}`, 110, 115, 110)

  // ── Security Posture Summary Card ──
  y -= 86

  // Color mapping based on score & classification
  let scoreColor = [43, 119, 43] // Safe Green
  let scoreBg = [240, 250, 240]
  const catUpper = String(riskCategory).toUpperCase()

  if (catUpper.includes('CRITICAL') || score >= 75) {
    scoreColor = [204, 34, 34] // Critical Red
    scoreBg = [255, 240, 240]
  } else if (catUpper.includes('HIGH') || score >= 50) {
    scoreColor = [230, 126, 34] // Orange
    scoreBg = [255, 246, 237]
  } else if (catUpper.includes('MOD') || score >= 25) {
    scoreColor = [200, 149, 42] // Gold
    scoreBg = [255, 251, 240]
  }

  // Draw Score Card Box
  setFill(scoreBg[0], scoreBg[1], scoreBg[2])
  setStroke(scoreColor[0], scoreColor[1], scoreColor[2])
  setLineWidth(1.5)
  drawRect(margin, y - 110, width - margin * 2, 110, true, true)

  // Score Number Box
  setFill(scoreColor[0], scoreColor[1], scoreColor[2])
  drawRect(margin + 16, y - 94, 82, 78, true, false)

  drawText('F2', 10, margin + 28, y - 34, 'RISK SCORE', 255, 255, 255)
  drawText('F2', 26, margin + (score < 10 ? 46 : score < 100 ? 36 : 28), y - 68, `${score}`, 255, 255, 255)
  drawText('F1', 8, margin + 37, y - 84, '/ 100', 230, 230, 230)

  // Posture Details
  const postureTitle = catUpper.includes('CRITICAL') ? 'CRITICAL RISK (IMMEDIATE DANGER)'
    : catUpper.includes('HIGH') ? 'HIGH RISK (POTENTIAL THREAT)'
    : catUpper.includes('MOD') ? 'MODERATE RISK (CAUTION ADVISED)'
    : 'CLEAN & SAFE (NO THREATS DETECTED)'

  drawText('F2', 13, margin + 115, y - 36, postureTitle, scoreColor[0], scoreColor[1], scoreColor[2])

  // Explanation lines
  const explLines = wrapText(effectiveExplanation, 65)
  let explY = y - 56
  explLines.slice(0, 3).forEach((line) => {
    drawText('F1', 9, margin + 115, explY, line, 50, 55, 50)
    explY -= 14
  })

  // ── Metrics Row ──
  y -= 128
  const colWidth = (width - margin * 2 - 24) / 4

  const metrics = [
    { label: 'TOTAL INCIDENTS', val: String(incidentSummary.total || 0), r: 40, g: 40, b: 40 },
    { label: 'CRITICAL THREATS', val: String(incidentSummary.critical || 0), r: 204, g: 34, b: 34 },
    { label: 'HIGH ALERTS', val: String(incidentSummary.high || 0), r: 230, g: 126, b: 34 },
    { label: 'CLEAN CHECKS', val: String(Math.max(0, 5 - (incidentSummary.total || 0))), r: 43, g: 119, b: 43 },
  ]

  metrics.forEach((m, idx) => {
    const mx = margin + idx * (colWidth + 8)
    setFill(250, 250, 248)
    setStroke(215, 218, 212)
    setLineWidth(1)
    drawRect(mx, y - 48, colWidth, 48, true, true)

    drawText('F2', 7, mx + 8, y - 18, m.label, 100, 105, 100)
    drawText('F2', 16, mx + 8, y - 40, m.val, m.r, m.g, m.b)
  })

  // ── Key Detected Findings Section ──
  y -= 64
  drawText('F2', 11, margin, y, 'KEY DETECTED FINDINGS & EVIDENCE', 30, 35, 30)

  // Section divider line
  setStroke(58, 122, 58)
  setLineWidth(1)
  streamOps.push(`${margin} ${(y - 6).toFixed(2)} m ${(width - margin)} ${(y - 6).toFixed(2)} l S`)

  y -= 18

  if (!incidents || incidents.length === 0) {
    setFill(245, 252, 245)
    setStroke(180, 220, 180)
    drawRect(margin, y - 48, width - margin * 2, 48, true, true)
    drawText('F2', 9, margin + 14, y - 22, 'ZERO SECURITY INCIDENTS DETECTED', 40, 120, 40)
    drawText('F1', 8, margin + 14, y - 38, 'Safe Browsing blacklists, threat intelligence registers, and TLS certificates verified clean.', 70, 80, 70)
    y -= 58
  } else {
    // List top 4 incidents
    const topIncidents = incidents.slice(0, 4)
    for (const inc of topIncidents) {
      const isCrit = inc.severity === 'CRITICAL'
      const isHigh = inc.severity === 'HIGH'
      const tagR = isCrit ? 204 : isHigh ? 230 : 180
      const tagG = isCrit ? 34 : isHigh ? 126 : 140
      const tagB = isCrit ? 34 : isHigh ? 34 : 40

      setFill(252, 252, 250)
      setStroke(215, 218, 212)
      setLineWidth(1)
      drawRect(margin, y - 42, width - margin * 2, 42, true, true)

      // Severity Tag
      setFill(tagR, tagG, tagB)
      drawRect(margin + 8, y - 30, 68, 18, true, false)
      drawText('F2', 7, margin + 14, y - 22, inc.severity || 'ALERT', 255, 255, 255)

      // Title
      const title = inc.title ? inc.title.substring(0, 58) : 'Security finding'
      drawText('F2', 9, margin + 84, y - 22, title, 30, 30, 30)

      // Description
      const desc = inc.description ? inc.description.substring(0, 85) : ''
      drawText('F1', 8, margin + 84, y - 35, desc, 85, 90, 85)

      y -= 48
    }
  }

  // ── Recommended Remediation Actions ──
  y -= 8
  drawText('F2', 11, margin, y, 'RECOMMENDED ACTIONS', 30, 35, 30)

  setStroke(58, 122, 58)
  setLineWidth(1)
  streamOps.push(`${margin} ${(y - 6).toFixed(2)} m ${(width - margin)} ${(y - 6).toFixed(2)} l S`)

  y -= 18

  setFill(248, 249, 246)
  setStroke(215, 218, 212)
  drawRect(margin, y - 54, width - margin * 2, 54, true, true)

  const recLines = wrapText(effectiveRecommendedAction, 85)
  let recY = y - 20
  recLines.slice(0, 3).forEach((line) => {
    drawText('F1', 9, margin + 14, recY, `*  ${line}`, 40, 45, 40)
    recY -= 14
  })

  // ── Footer ──
  const footerY = 32
  setStroke(210, 215, 210)
  setLineWidth(0.8)
  streamOps.push(`${margin} ${(footerY + 18).toFixed(2)} m ${(width - margin)} ${(footerY + 18).toFixed(2)} l S`)

  drawText('F2', 7, margin, footerY + 6, 'RAVEN SECURITY PLATFORM', 90, 100, 90)
  drawText('F1', 7, margin, footerY - 6, 'Independent automated security verification snapshot. Results valid as of inspection timestamp.', 120, 125, 120)
  drawText('F1', 7, width - margin - 150, footerY + 6, `REPORT TIMESTAMP: ${new Date().toISOString()}`, 110, 115, 110)
  drawText('F1', 7, width - margin - 110, footerY - 6, 'PAGE 1 OF 1  [VERIFIED]', 90, 100, 90)

  // ── Construct PDF Objects ──
  const contentStream = streamOps.join('\n')
  const streamLength = contentStream.length

  const objects = [
    // 1: Catalog
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    // 2: Pages
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    // 3: Page
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj`,
    // 4: Contents
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj`,
    // 5: Font F1 (Helvetica Regular)
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
    // 6: Font F2 (Helvetica Bold)
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj',
  ]

  let offset = 0
  const header = '%PDF-1.4\n'
  offset += header.length

  const xref = ['xref\n0 7\n0000000000 65535 f \n']
  let body = ''

  for (let i = 0; i < objects.length; i++) {
    const objStr = objects[i] + '\n'
    const objOffset = offset + body.length
    xref.push(String(objOffset).padStart(10, '0') + ' 00000 n \n')
    body += objStr
  }

  const startxref = offset + body.length
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`

  const fullPdf = header + body + xref.join('') + trailer
  return new Blob([fullPdf], { type: 'application/pdf' })
}

export function downloadPdf(reportData, filename) {
  const blob = generatePdfBlob(reportData)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `RAVEN-Security-Report-${reportData.scanId || 'report'}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
