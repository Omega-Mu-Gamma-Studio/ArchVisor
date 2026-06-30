/**
 * PipelineGrid — D3-based pipeline timing diagram grid
 *
 * Renders a cycle-by-cycle grid of pipeline stages.
 * Rows = instructions, Columns = cycles.
 * Each cell shows the stage label (IF/ID/EX/MEM/WB) or "stall" bubble.
 *
 * Props:
 *   diagram: object         // output of simulatePipeline()
 *   currentCycle: number    // which cycle to show up to (0 = none)
 *   showForwarding: boolean
 *   showHazards: boolean
 *   width: number
 *   height: number
 */

import { useRef, useEffect } from 'react'
import * as d3 from 'd3'

const STAGE_COLORS = {
  IF:   { bg: '#3b82f6', text: '#fff' },
  ID:   { bg: '#8b5cf6', text: '#fff' },
  EX:   { bg: '#22c55e', text: '#fff' },
  MEM:  { bg: '#f59e0b', text: '#fff' },
  WB:   { bg: '#ef4444', text: '#fff' },
}

const STALL_COLOR = { bg: '#4b5563', text: '#9ca3af' }
const BUBBLE_COLOR = { bg: '#1f2937', text: '#6b7280' }

const CELL_W = 70
const CELL_H = 34
const HEADER_H = 28
const LABEL_W = 130
const PADDING = { top: 12, right: 16, bottom: 12, left: 8 }

export default function PipelineGrid({
  diagram = null,
  currentCycle = 0,
  showForwarding = false,
  showHazards = false,
  width = 800,
  height = 400,
}) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current || !diagram || !diagram.diagram) return

    const instructions = diagram.diagram
    if (instructions.length === 0) return

    // Determine max cycles across all instructions
    const maxCycle = d3.max(instructions, instr =>
      d3.max(instr.stages, s => s.cycle)
    ) || 0

    const visibleCycles = currentCycle > 0 ? currentCycle : maxCycle

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const totalWidth = LABEL_W + visibleCycles * CELL_W + PADDING.left + PADDING.right
    const totalHeight = PADDING.top + PADDING.bottom + HEADER_H + instructions.length * CELL_H

    // Set viewBox
    svg
      .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block')

    const g = svg.append('g')

    // ── Header row (cycle numbers) ───
    for (let c = 0; c < visibleCycles; c++) {
      const x = LABEL_W + c * CELL_W
      const cycNum = c + 1

      g.append('rect')
        .attr('x', x)
        .attr('y', PADDING.top)
        .attr('width', CELL_W)
        .attr('height', HEADER_H)
        .attr('fill', 'var(--surface)')
        .attr('stroke', 'var(--border)')
        .attr('stroke-width', 0.5)

      g.append('text')
        .attr('x', x + CELL_W / 2)
        .attr('y', PADDING.top + HEADER_H / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--text-muted)')
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .text(`C${cycNum}`)
    }

    // ── Instruction rows ───
    instructions.forEach((instr, rowIdx) => {
      const y = PADDING.top + HEADER_H + rowIdx * CELL_H

      // Instruction label
      g.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', LABEL_W)
        .attr('height', CELL_H)
        .attr('fill', 'var(--surface)')
        .attr('stroke', 'var(--border)')
        .attr('stroke-width', 0.5)

      g.append('text')
        .attr('x', 8)
        .attr('y', y + CELL_H / 2 + 4)
        .attr('fill', 'var(--text)')
        .attr('font-family', 'var(--mono)')
        .attr('font-size', '10px')
        .attr('font-weight', '400')
        .text(instr.instruction.length > 22
          ? instr.instruction.slice(0, 20) + '…'
          : instr.instruction
        )

      // Stage cells
      const stagesForRow = instr.stages.filter(s => s.cycle <= visibleCycles && s.cycle > 0)

      stagesForRow.forEach((stage) => {
        const cx = LABEL_W + (stage.cycle - 1) * CELL_W
        const isStall = stage.stage === 'stall'
        const isBubble = stage.stage === 'bubble'
        const stageName = isStall ? 'stall' : isBubble ? 'bubble' : stage.stage
        const colors = isStall ? STALL_COLOR : isBubble ? BUBBLE_COLOR : STAGE_COLORS[stage.stage] || { bg: '#374151', text: '#9ca3af' }

        // Cell background
        g.append('rect')
          .attr('x', cx)
          .attr('y', y)
          .attr('width', CELL_W)
          .attr('height', CELL_H)
          .attr('fill', isStall ? 'url(#stallPattern)' : colors.bg)
          .attr('fill-opacity', isStall ? 0.3 : 0.2)
          .attr('stroke', isStall ? '#6b7280' : colors.bg)
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', isStall ? '3,3' : 'none')
          .attr('rx', 2)
          .attr('ry', 2)

        // Stage label
        g.append('text')
          .attr('x', cx + CELL_W / 2)
          .attr('y', y + CELL_H / 2 + 3)
          .attr('text-anchor', 'middle')
          .attr('fill', colors.text)
          .attr('font-family', 'var(--mono)')
          .attr('font-size', '10px')
          .attr('font-weight', '600')
          .text(isStall ? 'STALL' : isBubble ? '—' : stage.stage)

        // Hazard badge overlay
        if (showHazards && stage.hazard) {
          const hazardColors = {
            RAW: '#ef4444',
            control: '#8b5cf6',
            structural: '#3b82f6',
          }
          g.append('rect')
            .attr('x', cx + 4)
            .attr('y', y + 4)
            .attr('width', 14)
            .attr('height', 14)
            .attr('rx', 3)
            .attr('fill', hazardColors[stage.hazard] || '#ef4444')

          g.append('text')
            .attr('x', cx + 11)
            .attr('y', y + 14)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-family', 'var(--mono)')
            .attr('font-size', '7px')
            .attr('font-weight', '700')
            .text(stage.hazard === 'RAW' ? 'R' : stage.hazard === 'control' ? 'C' : 'S')
        }

        // Forwarding arrow indicator
        if (showForwarding && stage.forwarded) {
          g.append('text')
            .attr('x', cx + CELL_W - 8)
            .attr('y', y + 14)
            .attr('text-anchor', 'end')
            .attr('fill', '#22c55e')
            .attr('font-family', 'var(--mono)')
            .attr('font-size', '10px')
            .attr('font-weight', '700')
            .text('⤴')
        }
      })
    })

    // ── Stall pattern definition ───
    const defs = svg.select('defs').empty()
      ? svg.append('defs')
      : svg.select('defs')

    const pattern = defs.append('pattern')
      .attr('id', 'stallPattern')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 6)
      .attr('height', 6)
      .attr('patternTransform', 'rotate(45)')

    pattern.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 6)
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.4)

  }, [diagram, currentCycle, showForwarding, showHazards])

  if (!diagram || !diagram.diagram || diagram.diagram.length === 0) {
    return (
      <div style={{
        padding: '32px', textAlign: 'center',
        fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)',
      }}>
        Run a simulation to see the pipeline grid.
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '10px',
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      <svg ref={svgRef} />
    </div>
  )
}
