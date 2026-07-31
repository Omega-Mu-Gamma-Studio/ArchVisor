export const BOSS_FLAVOR = {
  unit1: {
    name: 'The Register Wraith',
    color: '#0ea5e9',
    geometry: 'icosahedron',
    hitTaunts: ['One slot corrupted.', 'Its registers flicker.', 'Direct hit!'],
    missTaunts: ['It reads your mind first.', 'Wrong slot — it laughs.', 'Miscalculated.'],
  },
  unit2: {
    name: 'The Sign Serpent',
    color: '#a855f7',
    geometry: 'octahedron',
    hitTaunts: ['It recoils, shifted.', 'A clean subtraction!', 'Bit by bit, it falls.'],
    missTaunts: ['It slithers past your guess.', 'Wrong shift.', 'The sign fooled you.'],
  },
  unit3: {
    name: 'The Hazard Hydra',
    color: '#f97316',
    geometry: 'tetrahedron',
    hitTaunts: ['A stall lands true!', 'Bubble inserted — hit!', 'It stumbles mid-pipeline.'],
    missTaunts: ['It forwards around your guess.', 'No stall there — miss.', 'Misread the hazard.'],
  },
  unit4: {
    name: 'The Coherence Colossus',
    color: '#22c55e',
    geometry: 'dodecahedron',
    hitTaunts: ['A line invalidated!', 'State transition — hit!', 'Its cache cracks.'],
    missTaunts: ['Still coherent — miss.', 'Wrong state.', 'It stayed shared.'],
  },
  unit5: {
    name: 'The Thrasher',
    color: '#db2777',
    geometry: 'torusKnot',
    hitTaunts: ['Evicted! Direct hit.', 'It thrashes and cracks.', 'Cache line destroyed!'],
    missTaunts: ['It dodges — still resident.', 'Wrong call.', 'It slipped back in cache.'],
  },
}
