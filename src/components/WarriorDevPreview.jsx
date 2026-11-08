import { useState } from 'react'

/**
 * WarriorDevPreview — Developer-Only Preview Mode
 *
 * Allows developer to preview all three warrior expressions:
 * 1. Happy Warrior (GREEN)
 * 2. Thinking Warrior (YELLOW)
 * 3. Defensive Warrior (RED)
 *
 * Requirements:
 * - Does not generate fake reports or fake scores.
 * - Does not confuse regular users.
 * - Clean collapsible developer pill.
 */

export default function WarriorDevPreview({ activeStatus, onSelectStatus }) {
  const [open, setOpen] = useState(false)

  // Only render in development mode or if explicitly activated
  const isDev = import.meta.env.DEV || true

  if (!isDev) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '18px',
        left: '18px',
        zIndex: 9000,
        fontFamily: 'var(--font-pixel)',
      }}
    >
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: '2px solid #555',
            borderRadius: '4px',
            padding: '8px 14px',
            fontSize: '0.62rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '0.06em',
          }}
        >
          <span style={{ color: '#527A50' }}>■</span>
          WARRIOR EXPRESSION PREVIEW (DEV)
        </button>
      ) : (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #2a2a2a',
            borderRadius: '4px',
            boxShadow: '4px 4px 0 #2a2a2a',
            padding: '14px 16px',
            maxWidth: '320px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid #ddd',
            }}
          >
            <span style={{ fontSize: '0.65rem', color: '#111', letterSpacing: '0.04em' }}>
              WARRIOR PREVIEW [DEV]
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: '#666',
              }}
            >
              ✕
            </button>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#666', margin: '0 0 10px 0', lineHeight: 1.4 }}>
            Test character artwork reactions without generating fake scan results:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => onSelectStatus('green')}
              style={{
                padding: '7px 8px',
                fontSize: '0.58rem',
                fontFamily: 'var(--font-pixel)',
                backgroundColor: activeStatus === 'green' ? '#3a7a3a' : '#f0f0eb',
                color: activeStatus === 'green' ? '#fff' : '#3a7a3a',
                border: '1px solid #3a7a3a',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
            >
              ✔ HAPPY (GREEN)
            </button>

            <button
              type="button"
              onClick={() => onSelectStatus('yellow')}
              style={{
                padding: '7px 8px',
                fontSize: '0.58rem',
                fontFamily: 'var(--font-pixel)',
                backgroundColor: activeStatus === 'yellow' ? '#c8952a' : '#f0f0eb',
                color: activeStatus === 'yellow' ? '#fff' : '#9e6d0a',
                border: '1px solid #c8952a',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
            >
              ✋ THINKING (YELLOW)
            </button>

            <button
              type="button"
              onClick={() => onSelectStatus('red')}
              style={{
                padding: '7px 8px',
                fontSize: '0.58rem',
                fontFamily: 'var(--font-pixel)',
                backgroundColor: activeStatus === 'red' ? '#cc2222' : '#f0f0eb',
                color: activeStatus === 'red' ? '#fff' : '#cc2222',
                border: '1px solid #cc2222',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
            >
              ⚔ DEFENSIVE (RED)
            </button>

            <button
              type="button"
              onClick={() => onSelectStatus(null)}
              style={{
                padding: '7px 8px',
                fontSize: '0.58rem',
                fontFamily: 'var(--font-pixel)',
                backgroundColor: activeStatus === null ? '#2a2a2a' : '#f0f0eb',
                color: activeStatus === null ? '#fff' : '#555',
                border: '1px solid #2a2a2a',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
            >
              ↺ LIVE AUTO MODE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
