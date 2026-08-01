/**
 * BossBattlePage — new route: /unit/:unitId/boss
 *
 * Maps a unitId to the existing tool component the boss battle uses, and
 * renders it inside BossBattleWrapper. Imports existing tool components
 * read-only (as any page already does) — does not modify them.
 */

import { useParams } from 'react-router-dom'
import BossBattleWrapper from '../components/BossBattleWrapper.jsx'

import MIPSExecutor from '../../units/unit1/MIPSExecutor.jsx'
import BoothMultiplier from '../../units/unit2/BoothMultiplier.jsx'
import PipelineAnimator from '../../units/unit3/PipelineAnimator.jsx'
import CacheCoherence from '../../units/unit4/CacheCoherence.jsx'
import CacheSimulator from '../../units/unit5/CacheSimulator.jsx'

const BOSS_TOOL_COMPONENTS = {
  unit1: MIPSExecutor,
  unit2: BoothMultiplier,
  unit3: PipelineAnimator,
  unit4: CacheCoherence,
  unit5: CacheSimulator,
}

export default function BossBattlePage() {
  const { unitId } = useParams()
  const ToolComponent = BOSS_TOOL_COMPONENTS[unitId]

  if (!ToolComponent) {
    return (
      <div style={{ padding: 32 }}>
        <p>No boss battle exists for unit "{unitId}".</p>
      </div>
    )
  }

  return <BossBattleWrapper unitId={unitId} ToolComponent={ToolComponent} />
}
