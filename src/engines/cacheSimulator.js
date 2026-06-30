/**
 * Cache Simulator Engine
 *
 * Simulates a configurable cache with step-by-step access logging.
 * Supports configurable size, block size, associativity, replacement policy,
 * and write policy.
 */

/**
 * @param {{
 *   cacheSize: number,
 *   blockSize: number,
 *   associativity: number,
 *   replacementPolicy: string,
 *   writePolicy: string
 * }} config
 * @param {Array<{ address: number, type: 'R'|'W' }>} referenceString
 * @returns {{
 *   steps: Array<{
 *     accessIndex: number,
 *     address: number,
 *     type: string,
 *     hit: boolean,
 *     setIndex: number,
 *     tag: number,
 *     blockOffset: number,
 *     evicted?: number,
 *     cacheState: Array<{ setIndex: number, ways: Array<{ tag: number|null, valid: boolean, dirty?: boolean }> }>
 *   }>,
 *   totalAccesses: number,
 *   hits: number,
 *   misses: number,
 *   hitRate: number,
 *   missRate: number
 * }}
 */
export function simulateCache(config, referenceString) {
  const { cacheSize, blockSize, associativity, replacementPolicy, writePolicy } = config

  const numBlocks = cacheSize / blockSize
  const numSets = associativity === 0 ? 1 : Math.max(1, numBlocks / associativity)
  const ways = associativity === 0 ? numBlocks : associativity

  // Cache structure: array of sets, each set is an array of ways
  // Each way: { tag, valid, dirty, lruCounter, fifoOrder }
  const cache = []
  let fifoCounter = 0

  for (let s = 0; s < numSets; s++) {
    const set = []
    for (let w = 0; w < ways; w++) {
      set.push({ tag: null, valid: false, dirty: false, lruCounter: 0, fifoOrder: -1 })
    }
    cache.push(set)
  }

  // Helper to compute tag, set index, offset
  const offsetBits = Math.log2(blockSize)
  const indexBits = Math.log2(numSets)
  const tagBits = 32 - offsetBits - (numSets > 1 ? indexBits : 0)

  function parseAddress(addr) {
    const blockOffset = addr & ((1 << offsetBits) - 1)
    const setIndex = numSets > 1 ? (addr >> offsetBits) & ((1 << indexBits) - 1) : 0
    const tag = addr >> (offsetBits + (numSets > 1 ? indexBits : 0))
    return { tag, setIndex, blockOffset }
  }

  const steps = []
  let hits = 0
  let misses = 0

  for (let i = 0; i < referenceString.length; i++) {
    const { address, type } = referenceString[i]
    const { tag, setIndex, blockOffset } = parseAddress(address)

    const set = cache[setIndex]
    let hit = false
    let evicted = null
    let hitWay = -1

    // Check for hit
    for (let w = 0; w < set.length; w++) {
      if (set[w].valid && set[w].tag === tag) {
        hit = true
        hitWay = w
        break
      }
    }

    if (hit) {
      hits++
      // Update LRU
      for (let w = 0; w < set.length; w++) {
        set[w].lruCounter++
      }
      set[hitWay].lruCounter = 0

      // Update dirty bit for writes
      if (type === 'W' && writePolicy === 'write-back') {
        set[hitWay].dirty = true
      }
    } else {
      misses++
      // Find a way to place the block (cache line)
      let replaceWay = -1

      // Check for invalid (empty) way first
      for (let w = 0; w < set.length; w++) {
        if (!set[w].valid) {
          replaceWay = w
          break
        }
      }

      // If all ways are valid, need to evict
      if (replaceWay === -1) {
        switch (replacementPolicy) {
          case 'LRU': {
            // Find the way with the highest LRU counter
            let maxLRU = -1
            for (let w = 0; w < set.length; w++) {
              if (set[w].lruCounter > maxLRU) {
                maxLRU = set[w].lruCounter
                replaceWay = w
              }
            }
            break
          }
          case 'FIFO': {
            // Find the way with the oldest (smallest) FIFO order
            let minFIFO = Infinity
            for (let w = 0; w < set.length; w++) {
              if (set[w].fifoOrder < minFIFO && set[w].fifoOrder >= 0) {
                minFIFO = set[w].fifoOrder
                replaceWay = w
              }
            }
            break
          }
          case 'Random':
          default: {
            replaceWay = Math.floor(Math.random() * set.length)
            break
          }
        }
      }

      // Evict the chosen way (if valid)
      if (replaceWay >= 0 && set[replaceWay].valid) {
        evicted = set[replaceWay].tag
        // If write-back and dirty, write back to memory
        if (writePolicy === 'write-back' && set[replaceWay].dirty) {
          // In a real system this would write to memory
        }
      }

      // Place the new block
      set[replaceWay] = {
        tag,
        valid: true,
        dirty: type === 'W' && writePolicy === 'write-back',
        lruCounter: 0,
        fifoOrder: fifoCounter++,
      }

      // Update LRU counters for other ways
      for (let w = 0; w < set.length; w++) {
        if (w !== replaceWay && set[w].valid) {
          set[w].lruCounter++
        }
      }
    }

    // Capture cache state snapshot
    const cacheState = cache.map((set, si) => ({
      setIndex: si,
      ways: set.map(w => ({
        tag: w.tag,
        valid: w.valid,
        dirty: w.dirty,
      })),
    }))

    steps.push({
      accessIndex: i,
      address,
      type,
      hit,
      setIndex,
      tag,
      blockOffset,
      evicted: evicted !== null ? evicted : undefined,
      cacheState,
    })
  }

  const totalAccesses = referenceString.length
  const hitRate = totalAccesses > 0 ? hits / totalAccesses : 0
  const missRate = totalAccesses > 0 ? misses / totalAccesses : 0

  return {
    steps,
    totalAccesses,
    hits,
    misses,
    hitRate,
    missRate,
  }
}
