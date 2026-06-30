/**
 * HazardBadge — Color-coded hazard type badge
 *
 * Props:
 *   type: 'RAW'|'WAW'|'WAR'|'control'|'structural'
 *   size: 'sm'|'md'|'lg'
 */

const HAZARD_COLORS = {
  RAW:       { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', dot: '#ef4444', label: 'RAW' },
  WAW:       { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', dot: '#f59e0b', label: 'WAW' },
  WAR:       { bg: 'rgba(250, 204, 21, 0.15)', text: '#eab308', dot: '#eab308', label: 'WAR' },
  control:   { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6', dot: '#8b5cf6', label: 'Control' },
  structural:{ bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', dot: '#3b82f6', label: 'Structural' },
}

const SIZE_MAP = {
  sm: { padding: '2px 8px', fontSize: '9px', dotSize: '5px', gap: '4px', borderRadius: '4px' },
  md: { padding: '3px 12px', fontSize: '10px', dotSize: '6px', gap: '5px', borderRadius: '6px' },
  lg: { padding: '4px 16px', fontSize: '11px', dotSize: '7px', gap: '6px', borderRadius: '8px' },
}

export default function HazardBadge({ type = 'RAW', size = 'md' }) {
  const colors = HAZARD_COLORS[type] || HAZARD_COLORS.RAW
  const sizes = SIZE_MAP[size] || SIZE_MAP.md

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizes.gap,
        padding: sizes.padding,
        borderRadius: sizes.borderRadius,
        background: colors.bg,
        color: colors.text,
        fontFamily: 'var(--mono)',
        fontSize: sizes.fontSize,
        fontWeight: 600,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: sizes.dotSize,
          height: sizes.dotSize,
          borderRadius: '50%',
          background: colors.dot,
          flexShrink: 0,
        }}
      />
      {colors.label}
    </span>
  )
}
