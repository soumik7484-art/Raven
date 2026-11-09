import { useState } from 'react'
import SecurityWarrior from './SecurityWarrior'

/**
 * RepoReport — Raven GitHub Repository Security Health Report
 * Integrates the Three-State Warrior Reaction System.
 */

function mapRepoResultToWarriorStatus(report) {
  if (!report || !report.security_health) return 'idle'
  const { risk_category, overall_score } = report.security_health

  // 1-100 scoring model: 1 is okay/green, 25-50 is normal/yellow, 100 is dangerous/red
  if (risk_category === 'CRITICAL_RISK' || risk_category === 'HIGH_RISK' || overall_score >= 60) {
    return 'red' // Defensive warrior (dangerous)
  }
  if (risk_category === 'NEEDS_ATTENTION' || risk_category === 'INCONCLUSIVE' || (overall_score >= 20 && overall_score < 60)) {
    return 'yellow' // Thinking warrior (normal / needs attention)
  }
  if (risk_category === 'HEALTHY' || overall_score <= 20) {
    return 'green' // Happy warrior (1/100 is green & okay)
  }
  return 'green'
}

export default function RepoReport({ report, onReset, devWarriorStatus = null }) {
  const [activeTab, setActiveTab] = useState('all')
  const [showAllFindings, setShowAllFindings] = useState(false)

  if (!report) return null

  const {
    repository_overview: repo,
    security_health: health,
    findings_summary: stats,
    findings = [],
    secret_detection: secrets = [],
    code_security: codeSec = [],
    dependency_security: deps = [],
    ai_summary: ai = {},
    scan_transparency: transparency = {}
  } = report

  // Determine warrior expression based on real backend risk verdict (or dev override)
  const warriorStatus = devWarriorStatus || mapRepoResultToWarriorStatus(report)

  // Filter findings based on active tab
  const filteredFindings = findings.filter((f) => {
    if (activeTab === 'all') return true
    if (activeTab === 'secrets') return f.category === 'Secret Exposure'
    if (activeTab === 'code') return f.category === 'Code Vulnerability'
    if (activeTab === 'deps') return f.category === 'Vulnerable Dependency'
    if (activeTab === 'critical') return f.severity === 'CRITICAL'
    return true
  })

  // Display only first 2 findings unless user clicks Show More
  const displayedFindings = showAllFindings
    ? filteredFindings
    : filteredFindings.slice(0, 2)

  // Risk styling
  const getRiskColor = (cat) => {
    switch (cat) {
      case 'CRITICAL_RISK': return '#cc2222'
      case 'HIGH_RISK': return '#e67e22'
      case 'NEEDS_ATTENTION': return '#c8952a'
      case 'HEALTHY': return '#3a7a3a'
      default: return '#7f8c8d'
    }
  }

  const getSeverityBadgeColor = (sev) => {
    switch (sev) {
      case 'CRITICAL': return { bg: '#fff0f0', border: '#cc2222', text: '#cc2222' }
      case 'HIGH': return { bg: '#fff6ed', border: '#e67e22', text: '#e67e22' }
      case 'MEDIUM': return { bg: '#fefbf0', border: '#c8952a', text: '#9e6d0a' }
      case 'LOW': return { bg: '#f5f0ff', border: '#7c3aed', text: '#7c3aed' }
      default: return { bg: '#f0f4f8', border: '#4a6572', text: '#4a6572' }
    }
  }

  return (
    <div
      style={{
        marginTop: '2rem',
        animation: 'fadeIn 0.3s ease-out both',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* ── A. Repository Overview & Prominent Warrior Reaction Banner ── */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '2px solid #2a2a2a',
          borderRadius: '4px',
          boxShadow: '4px 4px 0 #2a2a2a',
          overflow: 'hidden',
        }}
      >
        {/* Banner Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: '#f0f0eb',
            borderBottom: '2px solid #2a2a2a',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: getRiskColor(health.risk_category), fontSize: '0.9rem' }}>■</span>
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.75rem',
                color: '#111',
                letterSpacing: '0.06em',
              }}
            >
              SECURITY HEALTH REPORT · {repo.full_name?.toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            onClick={onReset}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.68rem',
              color: '#333',
              backgroundColor: '#fff',
              border: '1px solid #2a2a2a',
              borderRadius: '2px',
              padding: '5px 12px',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              boxShadow: '2px 2px 0 #2a2a2a',
            }}
          >
            ← SCAN ANOTHER REPO
          </button>
        </div>

        {/* Overview Body with Prominent Warrior Placement */}
        <div style={{ padding: '24px 20px' }}>
          <div
            className="report-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(240px, 280px) 1fr',
              gap: '24px',
              alignItems: 'stretch',
            }}
          >
            {/* Prominent Warrior Guardian Reaction */}
            <div
              className="report-warrior-box"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 14px',
                backgroundColor: '#fbfbf8',
                border: '2px solid #2a2a2a',
                borderRadius: '4px',
                boxShadow: '3px 3px 0 #2a2a2a',
                boxSizing: 'border-box',
                overflow: 'hidden',
                width: '100%',
              }}
            >
              <SecurityWarrior
                status={warriorStatus}
                size="card"
                showBadge={true}
              />
            </div>

            {/* Health Verdict & Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  padding: '16px 20px',
                  backgroundColor: '#f8f8f5',
                  border: '2px solid #2a2a2a',
                  borderRadius: '4px',
                  boxShadow: '3px 3px 0 #2a2a2a',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    minWidth: '76px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    backgroundColor: getRiskColor(health.risk_category),
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 0 rgba(0,0,0,0.3)',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.52rem',
                      letterSpacing: '0.06em',
                      opacity: 0.9,
                      marginBottom: '2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    RISK SCORE
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '1.4rem',
                        lineHeight: 1,
                      }}
                    >
                      {health.overall_score}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.62rem',
                        opacity: 0.9,
                      }}
                    >
                      / 100
                    </span>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.75rem',
                      color: getRiskColor(health.risk_category),
                      letterSpacing: '0.06em',
                      marginBottom: '6px',
                    }}
                  >
                    VERDICT: {health.risk_category.replace('_', ' ')}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8rem',
                      color: '#444',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {health.summary_explanation}
                  </p>
                </div>
              </div>

              {/* Repository Metadata Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <MetaBadge label="BRANCH" value={repo.default_branch} />
                <MetaBadge label="LANGUAGE" value={repo.language} />
                <MetaBadge label="VISIBILITY" value={repo.visibility.toUpperCase()} />
                <MetaBadge label="STARS" value={repo.stars?.toLocaleString() || '0'} />
              </div>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#666', paddingTop: '8px', borderTop: '1px dashed #d8d8d0' }}><span>⏱</span><span>Scan completed: {new Date(repo.scan_completed_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── B. Finding Statistics Counters ── */}
      <div
        className="stat-tiles-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        <StatTile label="CRITICAL" count={stats.critical} color="#cc2222" />
        <StatTile label="HIGH" count={stats.high} color="#e67e22" />
        <StatTile label="MEDIUM" count={stats.medium} color="#c8952a" />
        <StatTile label="SECRETS" count={stats.secrets} color="#cc2222" />
        <StatTile label="CODE (SAST)" count={stats.sast} color="#1a5e8a" />
        <StatTile label="CVE DEPS" count={stats.dependencies} color="#6c3483" />
      </div>

      {/* ── C. AI Security Summary & Action Blueprint ── */}
      {ai.summary && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #2a2a2a',
            borderRadius: '4px',
            boxShadow: '4px 4px 0 #2a2a2a',
            padding: '22px 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.75rem',
              color: '#3a7a3a',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            <span>⚡</span>
            AI SECURITY SUMMARY &amp; REMEDIATION BLUEPRINT
          </div>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.82rem',
              color: '#333',
              lineHeight: 1.7,
              marginBottom: '18px',
            }}
          >
            {ai.summary}
          </p>

          {/* Key Risks */}
          {ai.key_risks && ai.key_risks.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.68rem',
                  color: '#cc2222',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                }}
              >
                KEY OBSERVED VECTORS:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ai.key_risks.map((k, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#fff8f8',
                      borderLeft: '3px solid #cc2222',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem', color: '#111' }}>
                      {k.risk}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                      {k.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Steps */}
          {ai.next_steps && ai.next_steps.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.68rem',
                  color: '#3a7a3a',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                }}
              >
                PRIORITIZED DEVELOPER ACTIONS:
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {ai.next_steps.map((step, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8rem',
                      color: '#444',
                      lineHeight: 1.6,
                      marginBottom: '4px',
                    }}
                  >
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── D. Detailed Findings Explorer with Tabs ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #2a2a2a',
          borderRadius: '4px',
          boxShadow: '4px 4px 0 #2a2a2a',
          overflow: 'hidden',
        }}
      >
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f0f0eb',
            borderBottom: '2px solid #2a2a2a',
            overflowX: 'auto',
          }}
        >
          <FilterTab active={activeTab === 'all'} label={`ALL FINDINGS (${findings.length})`} onClick={() => { setActiveTab('all'); setShowAllFindings(false) }} />
          <FilterTab active={activeTab === 'secrets'} label={`SECRETS (${secrets.length})`} onClick={() => { setActiveTab('secrets'); setShowAllFindings(false) }} />
          <FilterTab active={activeTab === 'code'} label={`CODE SAST (${codeSec.length})`} onClick={() => { setActiveTab('code'); setShowAllFindings(false) }} />
          <FilterTab active={activeTab === 'deps'} label={`DEPENDENCIES (${deps.length})`} onClick={() => { setActiveTab('deps'); setShowAllFindings(false) }} />
        </div>

        {/* Findings List */}
        <div style={{ padding: '20px' }}>
          {filteredFindings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.8rem',
                  color: '#3a7a3a',
                  letterSpacing: '0.06em',
                  marginBottom: '6px',
                }}
              >
                NO FINDINGS IN THIS CATEGORY
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#666', margin: 0 }}>
                The security scanner found no flagged items under the selected filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {displayedFindings.map((f) => {
                const badge = getSeverityBadgeColor(f.severity)
                return (
                  <div
                    key={f.finding_id}
                    style={{
                      border: '2px solid #2a2a2a',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      boxShadow: '2px 2px 0 #2a2a2a',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Item Top Bar */}
                    <div
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#f8f8f5',
                        borderBottom: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '0.65rem',
                            padding: '3px 7px',
                            backgroundColor: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.text,
                            borderRadius: '2px',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {f.severity}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '0.65rem',
                            color: '#555',
                          }}
                        >
                          [{f.source_engine.toUpperCase()}]
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            color: '#111',
                          }}
                        >
                          {f.title}
                        </span>
                      </div>

                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          color: '#555',
                        }}
                      >
                        {f.file_path} {f.line_number > 0 && `:L${f.line_number}`}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#444', margin: 0, lineHeight: 1.6 }}>
                        {f.description}
                      </p>

                      {/* Masked Evidence */}
                      {f.evidence_summary && (
                        <div
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#f2f2ed',
                            border: '1px solid #dcdcd6',
                            borderRadius: '3px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: '#222',
                          }}
                        >
                          <strong>Evidence:</strong> {f.evidence_summary}
                        </div>
                      )}

                      {/* Remediation Advice */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                          marginTop: '4px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.75rem',
                          color: '#3a7a3a',
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>Remediation:</span>
                        <span>{f.remediation}</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Show More / Show Less Button */}
              {filteredFindings.length > 2 && (
                <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAllFindings(!showAllFindings)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '11px 24px',
                      backgroundColor: '#ffffff',
                      border: '2px solid #2a2a2a',
                      borderRadius: '4px',
                      boxShadow: '3px 3px 0 #2a2a2a',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '0.72rem',
                      color: '#111',
                      cursor: 'pointer',
                      letterSpacing: '0.06em',
                      transition: 'transform 0.1s ease, box-shadow 0.1s ease, background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0eb'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '4px 4px 0 #2a2a2a'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '3px 3px 0 #2a2a2a'
                    }}
                  >
                    <span>
                      {showAllFindings
                        ? '▲ SHOW LESS'
                        : `▼ SHOW MORE (+${filteredFindings.length - 2} MORE)`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── H. Scan Transparency & Limitations ── */}
      <div
        style={{
          backgroundColor: '#f8f8f5',
          border: '2px solid #2a2a2a',
          borderRadius: '4px',
          boxShadow: '3px 3px 0 #2a2a2a',
          padding: '18px 22px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.7rem',
            color: '#111',
            letterSpacing: '0.06em',
            marginBottom: '10px',
          }}
        >
          [SCAN TRANSPARENCY &amp; COVERAGE AUDIT]
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '12px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: '#555',
            lineHeight: 1.6,
          }}
        >
          <div>
            <strong>Engines Executed:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {transparency.tools_used?.map((t, idx) => <li key={idx}>{t}</li>)}
            </ul>
          </div>
          <div>
            <strong>Scope &amp; Limits:</strong>
            <p style={{ margin: '4px 0 0' }}>{transparency.repository_scope_examined}</p>
            <p style={{ margin: '4px 0 0' }}>{transparency.scan_limitations}</p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .report-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .report-warrior-box {
            max-width: 280px !important;
            margin: 0 auto !important;
          }
        }
        @media (max-width: 540px) {
          .stat-tiles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .report-header-top-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}

function MetaBadge({ label, value }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        backgroundColor: '#f0f0eb',
        border: '1px solid #ccc',
        borderRadius: '3px',
      }}
    >
      <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.62rem', color: '#666' }}>{label}:</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem', color: '#111' }}>{value}</span>
    </div>
  )
}

function StatTile({ label, count, color }) {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '2px solid #2a2a2a',
        borderRadius: '3px',
        boxShadow: '2px 2px 0 #2a2a2a',
        padding: '12px 14px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '1.2rem',
          color: color,
          lineHeight: 1,
          marginBottom: '4px',
        }}
      >
        {count}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.6rem',
          color: '#666',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function FilterTab({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '0.65rem',
        padding: '12px 18px',
        color: active ? '#111' : '#666',
        backgroundColor: active ? '#fff' : 'transparent',
        border: 'none',
        borderBottom: active ? '3px solid #3a7a3a' : '3px solid transparent',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        letterSpacing: '0.04em',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  )
}
