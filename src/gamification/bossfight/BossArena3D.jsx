/**
 * BossArena3D — the actual "3D fun" bit. A react-three-fiber scene with a
 * rotating boss crystal that reacts to the battle: flashes + particle burst
 * on a correct hit, shakes on a miss, and shatters into a particle cloud on
 * victory. Pure presentation — game state lives in BossFight.jsx.
 */

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

function BossGeometry({ geometry }) {
  switch (geometry) {
    case 'octahedron': return <octahedronGeometry args={[1.3, 0]} />
    case 'tetrahedron': return <tetrahedronGeometry args={[1.6, 1]} />
    case 'dodecahedron': return <dodecahedronGeometry args={[1.15, 0]} />
    case 'torusKnot': return <torusKnotGeometry args={[0.85, 0.3, 100, 16]} />
    default: return <icosahedronGeometry args={[1.3, 0]} />
  }
}

function Particles({ burstId, color, spread = 3, count = 26 }) {
  const pointsRef = useRef()
  const dataRef = useRef(null)
  const [active, setActive] = useState(false)
  // Lazy-init a mutable typed-array buffer once. This has to be a ref (not
  // state) because three.js writes into it in place every frame for
  // performance — that's the standard R3F buffer-geometry pattern.
  // eslint-disable-next-line react-hooks/refs
  if (!dataRef.current) {
    dataRef.current = { positions: new Float32Array(count * 3), velocities: [], life: 0 }
  }

  useEffect(() => {
    if (!burstId) return
    const d = dataRef.current
    d.life = 1
    d.velocities = []
    for (let i = 0; i < count; i++) {
      d.positions[i * 3] = 0
      d.positions[i * 3 + 1] = 0
      d.positions[i * 3 + 2] = 0
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = (0.6 + Math.random() * 0.8) * spread
      d.velocities.push([
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed,
      ])
    }
    // Syncs this particle system to the external "a hit/victory just
    // happened" signal (burstId) — the recommended escape hatch for this
    // rule is exactly this kind of external-system sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(true)
    if (pointsRef.current) pointsRef.current.geometry.attributes.position.needsUpdate = true
  }, [burstId, count, spread])

  useFrame((_, delta) => {
    const d = dataRef.current
    if (d.life <= 0 || !pointsRef.current) return
    d.life = Math.max(0, d.life - delta * 0.9)
    const pos = pointsRef.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      const [vx, vy, vz] = d.velocities[i] || [0, 0, 0]
      pos.array[i * 3] += vx * delta
      pos.array[i * 3 + 1] += vy * delta
      pos.array[i * 3 + 2] += vz * delta
    }
    pos.needsUpdate = true
    pointsRef.current.material.opacity = d.life
    if (d.life <= 0 && active) setActive(false)
  })

  return (
    <points ref={pointsRef} visible={active}>
      <bufferGeometry>
        {/* Reading the ref buffer here is required — three.js's
            bufferAttribute needs the actual typed-array instance, not a
            React-owned copy, so it can write into it every frame. */}
        {/* eslint-disable-next-line react-hooks/refs */}
        <bufferAttribute attach="attributes-position" count={count} array={dataRef.current.positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.09} transparent opacity={1} />
    </points>
  )
}

function BossMesh({ color, geometry, hitId, victoryId, defeated }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const wireRef = useRef()
  const materialRef = useRef()
  const flash = useRef(0)
  const shake = useRef(0)
  const shatterT = useRef(0)

  useEffect(() => {
    if (hitId) { flash.current = 1; shake.current = 0.18 }
  }, [hitId])

  useEffect(() => {
    if (victoryId) shatterT.current = 0.0001
  }, [victoryId])

  useFrame((_, delta) => {
    if (!meshRef.current || !groupRef.current) return
    meshRef.current.rotation.x += delta * 0.22
    meshRef.current.rotation.y += delta * 0.35
    if (wireRef.current) {
      wireRef.current.rotation.x = meshRef.current.rotation.x
      wireRef.current.rotation.y = meshRef.current.rotation.y
    }

    if (shake.current > 0) {
      groupRef.current.position.x = (Math.random() - 0.5) * shake.current
      groupRef.current.position.y = (Math.random() - 0.5) * shake.current
      shake.current = Math.max(0, shake.current - delta * 1.4)
    } else {
      groupRef.current.position.x = 0
      groupRef.current.position.y = 0
    }

    flash.current = Math.max(0, flash.current - delta * 2.6)
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.45 + flash.current * 2.2
    }

    if (shatterT.current > 0) {
      shatterT.current = Math.min(1, shatterT.current + delta * 1.1)
      const s = Math.max(0.0001, 1 - shatterT.current)
      meshRef.current.scale.setScalar(s)
      if (wireRef.current) wireRef.current.scale.setScalar(s * 1.02)
    } else if (!defeated) {
      const idle = 1 + Math.sin(performance.now() * 0.0015) * 0.04
      meshRef.current.scale.setScalar(idle)
      if (wireRef.current) wireRef.current.scale.setScalar(idle * 1.03)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <BossGeometry geometry={geometry} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.45}
          roughness={0.25}
          metalness={0.55}
        />
      </mesh>
      <mesh ref={wireRef}>
        <BossGeometry geometry={geometry} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>
      <Particles burstId={hitId} color={color} spread={2.4} count={22} />
      <Particles burstId={victoryId} color={color} spread={5} count={60} />
    </group>
  )
}

export default function BossArena3D({ color, geometry, hitId, victoryId, defeated }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 4]} intensity={60} color={color} />
        <pointLight position={[-3, -2, -3]} intensity={18} color="#ffffff" />
        <BossMesh color={color} geometry={geometry} hitId={hitId} victoryId={victoryId} defeated={defeated} />
      </Canvas>
    </div>
  )
}
