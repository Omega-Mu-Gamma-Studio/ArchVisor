/**
 * TLB & Virtual Memory Engine
 *
 * Simulates TLB lookup and 2-level page table walk
 * for virtual address translation.
 */

/**
 * @param {number} virtualAddress
 * @param {{
 *   pageSize: number,
 *   tlbEntries: number,
 *   pageTableEntries: number,
 *   tlb: Array<{ vpn: number, pfn: number, valid: boolean }>,
 *   pageTable: object
 * }} config
 * @returns {{
 *   virtualAddress: number,
 *   vpn1: number,
 *   vpn2: number,
 *   offset: number,
 *   tlbHit: boolean,
 *   pfn: number,
 *   physicalAddress: number,
 *   steps: Array<{ phase: string, label: string, detail: string }>
 * }}
 */
export function translateAddress(virtualAddress, config) {
  const { pageSize, tlbEntries, pageTableEntries, tlb, pageTable } = config
  const steps = []

  const offsetBits = Math.log2(pageSize)
  const entriesPerLevelBits = Math.log2(pageTableEntries)
  const vpnBits = 32 - offsetBits

  // Phase 1: Decompose
  const offset = virtualAddress & ((1 << offsetBits) - 1)
  const vpn = virtualAddress >> offsetBits
  const vpn2 = vpn & ((1 << entriesPerLevelBits) - 1)
  const vpn1 = vpn >> entriesPerLevelBits

  steps.push({
    phase: 'decompose',
    label: 'Virtual Address Decomposition',
    detail: `VA = 0x${virtualAddress.toString(16).padStart(8, '0')} → ` +
            `VPN1 = ${vpn1} (0x${vpn1.toString(16)}) | ` +
            `VPN2 = ${vpn2} (0x${vpn2.toString(16)}) | ` +
            `Offset = ${offset} (0x${offset.toString(16)})`,
  })

  // Phase 2: TLB Lookup
  let tlbHit = false
  let pfn = -1
  let hitIndex = -1

  for (let i = 0; i < tlb.length; i++) {
    if (tlb[i].valid && tlb[i].vpn === vpn) {
      tlbHit = true
      pfn = tlb[i].pfn
      hitIndex = i
      break
    }
  }

  if (tlbHit) {
    steps.push({
      phase: 'tlb-lookup',
      label: 'TLB Lookup — HIT',
      detail: `VPN ${vpn} found in TLB entry ${hitIndex} → PFN = ${pfn} (0x${pfn.toString(16)})`,
    })
  } else {
    steps.push({
      phase: 'tlb-lookup',
      label: 'TLB Lookup — MISS',
      detail: `VPN ${vpn} not found in TLB. Proceeding to page table walk.`,
    })

    // Phase 3: Page Table Walk
    steps.push({
      phase: 'page-table-walk',
      label: 'Page Table Walk — Level 1',
      detail: `L1 index = VPN1 = ${vpn1}. Looking up L1[${vpn1}]...`,
    })

    // L1 entry
    const l1Entry = pageTable && pageTable[vpn1]

    if (!l1Entry || !l1Entry.valid) {
      steps.push({
        phase: 'page-table-walk',
        label: 'Page Table Walk — Level 1 MISS',
        detail: `L1[${vpn1}] is invalid. Page fault!`,
      })
      return {
        virtualAddress,
        vpn1,
        vpn2,
        offset,
        tlbHit: false,
        pfn: -1,
        physicalAddress: -1,
        steps,
      }
    }

    steps.push({
      phase: 'page-table-walk',
      label: 'Page Table Walk — Level 2',
      detail: `L2 pointer from L1[${vpn1}] = ${l1Entry.ptr}. L2 index = VPN2 = ${vpn2}. Looking up L2[${vpn2}]...`,
    })

    const l2Table = l1Entry.table || {}
    const l2Entry = l2Table[vpn2]

    if (!l2Entry || !l2Entry.valid) {
      steps.push({
        phase: 'page-table-walk',
        label: 'Page Table Walk — Level 2 MISS',
        detail: `L2[${vpn2}] is invalid. Page fault!`,
      })
      return {
        virtualAddress,
        vpn1,
        vpn2,
        offset,
        tlbHit: false,
        pfn: -1,
        physicalAddress: -1,
        steps,
      }
    }

    pfn = l2Entry.pfn
    steps.push({
      phase: 'page-table-walk',
      label: 'Page Table Walk — Complete',
      detail: `L2[${vpn2}] → PFN = ${pfn} (0x${pfn.toString(16)})`,
    })
  }

  // Phase 4: Assemble Physical Address
  const physicalAddress = (pfn << offsetBits) | offset

  steps.push({
    phase: 'assemble',
    label: 'Physical Address Assembly',
    detail: `PA = (PFN << ${offsetBits}) | Offset = (${pfn} << ${offsetBits}) | ${offset} = 0x${physicalAddress.toString(16).padStart(8, '0')}`,
  })

  return {
    virtualAddress,
    vpn1,
    vpn2,
    offset,
    tlbHit,
    pfn,
    physicalAddress,
    steps,
  }
}
