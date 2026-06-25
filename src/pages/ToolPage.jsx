import { useParams, useNavigate } from 'react-router-dom'

export default function ToolPage() {
  const { unitId, toolId } = useParams()
  const navigate = useNavigate()

  const toolName = toolId
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="bg-grid" />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '100px 24px 80px' }}>

        <button
          onClick={() => navigate(`/unit/${unitId}`)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '12px',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '0 0 32px', transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Unit {unitId}
        </button>

        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 24px var(--accent-glow)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>

          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent-text)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
            Unit {unitId} · Coming Soon
          </span>

          <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '16px' }}>
            {toolName}
          </h2>

          <p style={{ fontSize: '15px', color: 'var(--text)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.7 }}>
            This simulator is currently under development. Check back soon — it's going to be good.
          </p>

          <div style={{
            marginTop: '36px', padding: '14px 20px',
            background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
            border: '1px solid var(--border)',
            fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)',
          }}>
            <span style={{ color: 'var(--accent-text)' }}>$</span> building {toolId}...
          </div>
        </div>
      </div>
    </div>
  )
}