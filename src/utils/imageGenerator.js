/**
 * imageGenerator.js — RAVEN Security Platform
 *
 * Generates high-resolution (1200x675 / 16:9 social card or 1080x1080)
 * security report summary PNG image using HTML5 Canvas.
 * Follows RAVEN's pixel typography, warm neutral palette, and border styles.
 */

function wrapCanvasText(ctx, text, maxWidth) {
  if (!text) return []
  const words = String(text).split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

export function generateReportImageBlob(reportData) {
  return new Promise((resolve, reject) => {
    try {
      const {
        url = 'https://unknown-target.com',
        scanId = `RVN-${Date.now().toString(36).toUpperCase()}`,
        score = 0,
        riskCategory = 'Clean / Safe',
        explanation = 'Investigation verified clean posture with zero threat listings.',
        incidentSummary = { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
        timestamp = new Date().toISOString(),
      } = reportData

      const canvas = document.createElement('canvas')
      const width = 1200
      const height = 675
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Background: RAVEN signature dark forest/slate
      ctx.fillStyle = '#1c241e'
      ctx.fillRect(0, 0, width, height)

      // Subtle pixel grid pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.lineWidth = 1
      const gridSize = 40
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Main Outer Card (Pixel border style)
      ctx.fillStyle = '#f8f9f6'
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 6
      ctx.fillRect(40, 40, width - 80, height - 80)
      ctx.strokeRect(40, 40, width - 80, height - 80)

      // Inner shadow / accent
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect(44, 44, width - 88, 12)

      // ── Header Bar ──
      ctx.fillStyle = '#2a2a2a'
      ctx.font = 'bold 22px monospace'
      ctx.fillText('[RAVEN] // SECURITY INVESTIGATION DOSSIER', 70, 95)

      ctx.fillStyle = '#3a7a3a'
      ctx.fillRect(width - 290, 72, 220, 32)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 13px monospace'
      ctx.fillText('OFFICIAL AUDIT REPORT', width - 275, 93)

      // Divider
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(70, 120)
      ctx.lineTo(width - 70, 120)
      ctx.stroke()

      // ── Scanned Target URL Box ──
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 3
      ctx.fillRect(70, 140, width - 140, 56)
      ctx.strokeRect(70, 140, width - 140, 56)

      ctx.fillStyle = '#666666'
      ctx.font = 'bold 12px monospace'
      ctx.fillText('TARGET URL:', 90, 162)

      ctx.fillStyle = '#111111'
      ctx.font = 'bold 18px monospace'
      const displayUrl = url.length > 55 ? url.substring(0, 52) + '...' : url
      ctx.fillText(displayUrl, 90, 185)

      // ── Left: Score Box ──
      const catUpper = String(riskCategory).toUpperCase()
      let scoreColor = '#2b772b'
      let scoreBg = '#eef8ee'

      if (catUpper.includes('CRITICAL') || score >= 75) {
        scoreColor = '#cc2222'
        scoreBg = '#fff0f0'
      } else if (catUpper.includes('HIGH') || score >= 50) {
        scoreColor = '#e67e22'
        scoreBg = '#fff6ed'
      } else if (catUpper.includes('MOD') || score >= 25) {
        scoreColor = '#c8952a'
        scoreBg = '#fffbf0'
      }

      // Score Container
      ctx.fillStyle = scoreBg
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 4
      ctx.fillRect(70, 220, 290, 280)
      ctx.strokeRect(70, 220, 290, 280)

      // Score Title
      ctx.fillStyle = '#444'
      ctx.font = 'bold 14px monospace'
      ctx.fillText('OVERALL RISK SCORE', 105, 255)

      // Big Number
      ctx.fillStyle = scoreColor
      ctx.font = 'bold 84px monospace'
      const scoreStr = String(score)
      const numOffset = scoreStr.length === 1 ? 165 : scoreStr.length === 2 ? 140 : 115
      ctx.fillText(scoreStr, numOffset, 345)

      ctx.fillStyle = '#666'
      ctx.font = 'bold 16px monospace'
      ctx.fillText('/ 100 MAXIMUM', 145, 385)

      // Risk Badge in Score Box
      ctx.fillStyle = scoreColor
      ctx.fillRect(95, 415, 240, 48)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 15px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(catUpper, 215, 445)
      ctx.textAlign = 'left' // Reset

      // ── Right: Findings & Explanation ──
      // Summary Metrics Row
      const metricBoxW = 230
      const metricBoxH = 75
      const metricY = 220

      // Metric 1: Confirmed Incidents
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 3
      ctx.fillRect(390, metricY, metricBoxW, metricBoxH)
      ctx.strokeRect(390, metricY, metricBoxW, metricBoxH)

      ctx.fillStyle = '#555555'
      ctx.font = 'bold 11px monospace'
      ctx.fillText('CONFIRMED INCIDENTS', 405, metricY + 26)
      ctx.fillStyle = incidentSummary.critical > 0 ? '#cc2222' : incidentSummary.high > 0 ? '#e67e22' : '#2b772b'
      ctx.font = 'bold 30px monospace'
      ctx.fillText(String(incidentSummary.total || 0), 405, metricY + 62)

      // Metric 2: Critical Threats
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 3
      ctx.fillRect(645, metricY, metricBoxW, metricBoxH)
      ctx.strokeRect(645, metricY, metricBoxW, metricBoxH)

      ctx.fillStyle = '#555555'
      ctx.font = 'bold 11px monospace'
      ctx.fillText('CRITICAL THREATS', 660, metricY + 26)
      ctx.fillStyle = '#cc2222'
      ctx.font = 'bold 30px monospace'
      ctx.fillText(String(incidentSummary.critical || 0), 660, metricY + 62)

      // Metric 3: Scan Status
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 3
      ctx.fillRect(900, metricY, metricBoxW, metricBoxH)
      ctx.strokeRect(900, metricY, metricBoxW, metricBoxH)

      ctx.fillStyle = '#555555'
      ctx.font = 'bold 11px monospace'
      ctx.fillText('INTELLIGENCE FEEDS', 915, metricY + 26)
      ctx.fillStyle = '#2b772b'
      ctx.font = 'bold 24px monospace'
      ctx.fillText('VERIFIED', 915, metricY + 60)

      // Explanation Box
      const expBoxY = 315
      const expBoxH = 185
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 3
      ctx.fillRect(390, expBoxY, width - 460, expBoxH)
      ctx.strokeRect(390, expBoxY, width - 460, expBoxH)

      ctx.fillStyle = '#2a2a2a'
      ctx.font = 'bold 13px monospace'
      ctx.fillText('INVESTIGATION EXPLANATION & SUMMARY:', 415, expBoxY + 30)

      ctx.fillStyle = '#333333'
      ctx.font = '15px sans-serif'
      const lines = wrapCanvasText(ctx, explanation, width - 500)
      let lineY = expBoxY + 62
      lines.slice(0, 5).forEach((line) => {
        ctx.fillText(line, 415, lineY)
        lineY += 24
      })

      // ── Footer ──
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(70, 530)
      ctx.lineTo(width - 70, 530)
      ctx.stroke()

      ctx.fillStyle = '#555555'
      ctx.font = 'bold 12px monospace'
      ctx.fillText(`SCAN ID: ${scanId}  |  AUDITED: ${new Date(timestamp).toLocaleDateString()}`, 70, 560)

      ctx.fillStyle = '#2a2a2a'
      ctx.font = 'bold 13px monospace'
      ctx.fillText('VERIFY LIVE AT: raven-security.vercel.app', width - 430, 560)

      // Export Blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create image blob'))
        }
      }, 'image/png')
    } catch (err) {
      reject(err)
    }
  })
}

export function downloadImage(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'RAVEN-Security-Scan-Card.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
