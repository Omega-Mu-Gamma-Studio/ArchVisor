import { useNavigate } from 'react-router-dom'

const UNITS = [
  {
    id: 1,
    roman: 'I',
    title: 'Basic Structure',
    sub: 'Computer Organization',
    description: 'Functional units, fetch-decode-execute, MIPS ISA, instruction formats, and addressing modes.',
    tools: 4,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/>
        <rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>
        <line x1="7" y1="10" x2="7" y2="14"/><line x1="17" y1="10" x2="17" y2="14"/>
        <line x1="10" y1="7" x2="14" y2="7"/><line x1="10" y1="17" x2="14" y2="17"/>
      </svg>
    ),
  },
  {
    id: 2,
    roman: 'II',
    title: 'Arithmetic',
    sub: 'For Computers',
    description: "Binary addition, Booth's algorithm, restoring division, IEEE 754 floating point, and subword parallelism.",
    tools: 5,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="8.5" y1="16" x2="10.5" y2="16"/><line x1="13.5" y1="16" x2="15.5" y2="16"/>
      </svg>
    ),
  },
  {
    id: 3,
    roman: 'III',
    title: 'Processor',
    sub: '& Control Unit',
    description: '5-stage MIPS pipeline, datapath, hazard detection, stall/forwarding, and superscalar operation.',
    tools: 4,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="7" width="10" height="10" rx="1"/>
        <line x1="7" y1="9" x2="3" y2="9"/><line x1="7" y1="12" x2="3" y2="12"/><line x1="7" y1="15" x2="3" y2="15"/>
        <line x1="17" y1="9" x2="21" y2="9"/><line x1="17" y1="12" x2="21" y2="12"/><line x1="17" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="7" x2="9" y2="3"/><line x1="12" y1="7" x2="12" y2="3"/><line x1="15" y1="7" x2="15" y2="3"/>
        <line x1="9" y1="17" x2="9" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="15" y1="17" x2="15" y2="21"/>
      </svg>
    ),
  },
  {
    id: 4,
    roman: 'IV',
    title: 'Parallelism',
    sub: 'Architecture',
    description: "Flynn's taxonomy, multithreading, MESI cache coherence, GPU architecture, and cluster computing.",
    tools: 5,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="6" x2="19" y2="6"/><line x1="5" y1="10" x2="19" y2="10"/>
        <line x1="5" y1="14" x2="19" y2="14"/><line x1="5" y1="18" x2="19" y2="18"/>
        <circle cx="8" cy="6" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="14" cy="10" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="10" cy="14" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="16" cy="18" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 5,
    roman: 'V',
    title: 'Memory',
    sub: '& I/O Systems',
    description: 'Memory hierarchy, cache simulation, virtual memory & TLB, I/O methods, buses, and USB.',
    tools: 5,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="4" rx="1"/>
        <rect x="3" y="11" width="18" height="4" rx="1"/>
        <rect x="3" y="17" width="18" height="4" rx="1"/>
        <circle cx="7" cy="7" r="0.8" fill="currentColor" stroke="none"/>
        <circle cx="7" cy="13" r="0.8" fill="currentColor" stroke="none"/>
        <circle cx="7" cy="19" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Animated grid background */}
      <div className="bg-grid" />

      {/* Radial accent glow behind hero */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: 'radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ──────────────────────────────── */}
        <section style={{
          paddingTop: '140px',
          paddingBottom: '80px',
          textAlign: 'center',
          maxWidth: '860px',
          margin: '0 auto',
          padding: '140px 24px 80px',
        }}>

          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <span className="badge">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }}/>
              CS22304 · Omega Mu Gamma Studio
            </span>
          </div>

          {/* Main heading */}
          <h1 style={{
            fontSize: 'clamp(52px, 8vw, 88px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.0,
            marginBottom: '24px',
            color: 'var(--text-h)',
          }}>
            Arch
            <span className="glow-text">Visor</span>
          </h1>

          {/* Tagline */}
          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '15px',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            Look inside the machine.
          </p>

          <p style={{
            fontSize: '17px',
            color: 'var(--text)',
            maxWidth: '520px',
            margin: '0 auto 56px',
            lineHeight: 1.7,
          }}>
            23 interactive simulators, visualizers, and animated explainers — one for every concept in Computer Organization & Architecture.
          </p>
        </section>

        {/* ── Unit Cards ────────────────────────── */}
        <section style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 24px 100px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            {UNITS.map((unit) => (
              <UnitCard key={unit.id} unit={unit} onClick={() => navigate(`/unit/${unit.id}`)} />
            ))}
          </div>
        </section>

        {/* ── Footer hint ───────────────────────── */}
        <div style={{
          textAlign: 'center',
          paddingBottom: '48px',
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
        }}>
          BUILT AT OMEGA MU GAMMA STUDIO
        </div>
      </div>
    </div>
  )
}

function UnitCard({ unit, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="glass-card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Top row: icon + unit label */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: '52px', height: '52px',
          borderRadius: '12px',
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-text)',
          transition: 'box-shadow 0.25s',
          boxShadow: hovered ? '0 0 16px var(--accent-glow)' : 'none',
        }}>
          {unit.icon}
        </div>

        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginTop: '4px',
        }}>
          Unit {unit.roman}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--text-h)', marginBottom: '4px' }}>
          {unit.title}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--accent-text)', fontFamily: 'var(--mono)', marginBottom: '12px' }}>
          {unit.sub}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.65 }}>
          {unit.description}
        </p>
      </div>

      {/* Footer: tool count + arrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '11px',
          color: 'var(--text-muted)', letterSpacing: '0.08em',
        }}>
          {unit.tools} TOOLS
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            transform: hovered ? 'translateX(4px)' : 'translateX(0)',
            transition: 'transform 0.2s',
            opacity: hovered ? 1 : 0.4,
          }}
        >
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </div>
  )
}

// Need useState in scope for UnitCard
import { useState } from 'react'