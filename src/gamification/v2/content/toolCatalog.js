/**
 * Shared catalog of the app's real 23 sub-tools, matching the exact
 * unitId/toolId strings used by ToolPage.jsx's COMPONENT_MAP and
 * Sidebar.jsx's UNITS (numeric unit ids '1'..'5', kebab-case tool ids).
 *
 * This is the single source of truth v2 features read from — no feature
 * should hardcode its own copy of this list.
 *
 * `prerequisites` is a simple default: within a unit, tools unlock in
 * order; the first tool of unit N (N>1) additionally requires the last
 * tool of unit N-1. This is an original, additive convenience mapping —
 * it does not come from (and does not modify) any existing file.
 */

export const UNIT_TITLES = {
  1: 'Basic Structure',
  2: 'Arithmetic',
  3: 'Processor',
  4: 'Parallel Architectures',
  5: 'Memory & I/O',
}

const RAW_UNITS = [
  { unitId: '1', tools: ['anatomy-explorer', 'instruction-encoder', 'register-viewer', 'mips-executor'] },
  { unitId: '2', tools: ['binary-adder', 'booth', 'restoring-div', 'ieee754', 'subword-demo'] },
  { unitId: '3', tools: ['datapath-viewer', 'pipeline-animator', 'hazard-classifier', 'superscalar-comparator'] },
  { unitId: '4', tools: ['flynn-taxonomy', 'multithreading', 'cache-coherence', 'gpu-explainer', 'cluster-overview'] },
  { unitId: '5', tools: ['memory-hierarchy', 'cache-simulator', 'virtual-memory', 'io-comparator', 'usb-overview'] },
]

function titleCase(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export const TOOL_CATALOG = RAW_UNITS.flatMap(({ unitId, tools }) =>
  tools.map((toolId, i) => {
    const prerequisites = []
    if (i > 0) {
      prerequisites.push(`${unitId}/${tools[i - 1]}`)
    } else {
      const unitIndex = RAW_UNITS.findIndex((u) => u.unitId === unitId)
      const prevUnit = RAW_UNITS[unitIndex - 1]
      if (prevUnit) prerequisites.push(`${prevUnit.unitId}/${prevUnit.tools[prevUnit.tools.length - 1]}`)
    }
    return {
      key: `${unitId}/${toolId}`,
      unitId,
      toolId,
      label: titleCase(toolId),
      prerequisites,
    }
  })
)

export const TOOL_BY_KEY = Object.fromEntries(TOOL_CATALOG.map((t) => [t.key, t]))

export function toolKey(unitId, toolId) {
  return `${unitId}/${toolId}`
}
