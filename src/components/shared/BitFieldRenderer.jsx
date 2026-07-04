/**
 * BitFieldRenderer
 *
 * Renders a color-coded SVG bit-field breakdown.
 * Used by InstructionEncoder, IEEE754Explorer, etc.
 */

const BIT_HEIGHT = 36
const BIT_GAP = 2
const LABEL_HEIGHT = 18
const VALUE_HEIGHT = 14
const PADDING = 4

export default function BitFieldRenderer({
  fields = [],
  totalBits = 32,
  showLabels = true,
  showRange = true,
  showDecimal = true,
}) {
  if (!fields || fields.length === 0) {
    return (
      <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)', padding: '16px', textAlign: 'center' }}>
        No bit fields to display.
      </div>
    )
  }

  const totalWidth = 100 // percent
  const svgHeight = (showLabels ? LABEL_HEIGHT : 0) + BIT_HEIGHT + (showRange ? VALUE_HEIGHT + 4 : 0) + PADDING * 2

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '10px',
      border: '1px solid var(--border)',
      padding: '12px',
      overflow: 'hidden',
    }}>
      <svg
        viewBox={`0 0 ${totalWidth * 10} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {fields.map((field, i) => {
          const bitWidth = field.bits ? field.bits.length : Math.floor(totalBits / fields.length)
          const fieldWidth = (bitWidth / totalBits) * totalWidth * 10
          const xOffset = fields.slice(0, i).reduce((sum, f) => {
            const fBits = f.bits ? f.bits.length : Math.floor(totalBits / fields.length)
            return sum + (fBits / totalBits) * totalWidth * 10
          }, 0)

          const color = field.color || '#666'
          const yBits = PADDING + (showLabels ? LABEL_HEIGHT : 0)

          return (
            <g key={field.label || i}>
              {/* Label above the bit block */}
              {showLabels && (
                <text
                  x={xOffset + fieldWidth / 2}
                  y={PADDING + 12}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9"
                >
                  {field.label}
                </text>
              )}

              {/* Range label */}
              {showRange && field.range && (
                <text
                  x={xOffset + fieldWidth / 2}
                  y={svgHeight - PADDING - 2}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="8"
                >
                  {field.range}
                </text>
              )}

              {/* Bit block */}
              <rect
                x={xOffset}
                y={yBits}
                width={fieldWidth}
                height={BIT_HEIGHT}
                rx="3"
                ry="3"
                fill={color}
                opacity="0.85"
              />

              {/* Bit string inside block */}
              {field.bits && (
                <text
                  x={xOffset + fieldWidth / 2}
                  y={yBits + BIT_HEIGHT / 2 + 4}
                  textAnchor="middle"
                  fill="#fff"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize={fieldWidth > 40 ? '10' : '7'}
                  fontWeight="500"
                >
                  {field.bits}
                </text>
              )}

              {/* Decimal value below */}
              {showDecimal && field.bits && field.bits.length > 0 && (
                <text
                  x={xOffset + fieldWidth / 2}
                  y={yBits + BIT_HEIGHT + 12}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="8"
                >
                  {parseInt(field.bits, 2)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
