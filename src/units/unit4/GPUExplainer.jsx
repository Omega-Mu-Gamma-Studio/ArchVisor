/**
 * GPUExplainer — Animated slide-style guided tour of GPU architecture
 *
 * Sections: GPU vs CPU, Streaming Multiprocessors, SIMT Execution, Warp Scheduling, Thread Block Grid
 * Hand-crafted React SVG + Framer Motion animations
 * Progress dots indicator
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDES = [
  {
    id: 'gpu-vs-cpu',
    title: 'GPU vs CPU',
    subtitle: 'Why GPUs are different',
    content: `GPUs prioritize throughput over latency. A CPU has a few powerful cores (4–16) with large caches and advanced branch prediction. A GPU has thousands of simpler cores designed for massively parallel workloads.`,
    metrics: [
      { label: 'CPU Cores', cpu: '4–16', gpu: '1,000s' },
      { label: 'Cache per core', cpu: 'Large (MB)', gpu: 'Small (KB)' },
      { label: 'Control logic', cpu: 'Complex', gpu: 'Minimal' },
      { label: 'Memory BW', cpu: '50–100 GB/s', gpu: '500–900 GB/s' },
    ],
  },
  {
    id: 'sm',
    title: 'Streaming Multiprocessors',
    subtitle: 'The building blocks of a GPU',
    content: `Each SM contains multiple CUDA cores (e.g., 128 per SM), shared memory, register file, warp scheduler, and instruction cache. A GPU like the A100 has 108 SMs, each with 64 FP32 CUDA cores — 6,912 total.`,
  },
  {
    id: 'simt',
    title: 'SIMT Execution',
    subtitle: 'Single Instruction, Multiple Threads',
    content: `Threads are grouped into warps of 32. All threads in a warp execute the same instruction simultaneously on different data elements — SIMD-like but with per-thread register state and divergence handling.`,
  },
  {
    id: 'warp',
    title: 'Warp Scheduling',
    subtitle: 'Hiding latency through thread switching',
    content: `When one warp stalls (waiting for memory), the warp scheduler instantly switches to another ready warp. With thousands of threads, the GPU can hide memory latency almost completely — no need for large caches.`,
  },
  {
    id: 'blocks',
    title: 'Thread Block Grid',
    subtitle: 'Grid of thread blocks on SMs',
    content: `A kernel launches a grid of thread blocks. Each block is assigned to an SM and contains multiple warps. Blocks are independent — they can execute in any order, enabling automatic scalability across SMs.`,
  },
]

const SM_DIAGRAM_W = 400
const SM_DIAGRAM_H = 220

export default function GPUExplainer() {
  const [slide, setSlide] = useState(0)
  const current = SLIDES[slide]

  const next = () => setSlide(Math.min(slide + 1, SLIDES.length - 1))
  const prev = () => setSlide(Math.max(slide - 1, 0))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <span className="badge" style={{ marginBottom: '12px', display: 'inline-flex' }}>
          Unit IV · Tool 4
        </span>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
          GPU Explainer
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text)', maxWidth: '560px', lineHeight: 1.7 }}>
          An interactive guided tour of GPU architecture — from SMs to warp scheduling.
        </p>
      </div>

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="glass-card"
          style={{ padding: '28px', overflow: 'hidden' }}
        >
          {/* Slide header */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: '9px',
              color: 'var(--accent-text)', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {current.subtitle}
            </span>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-h)', marginTop: '4px' }}>
              {current.title}
            </h3>
          </div>

          {/* Content by slide type */}
          {current.id === 'gpu-vs-cpu' && <GpuVsCpuContent />}
          {current.id === 'sm' && <SMContent />}
          {current.id === 'simt' && <SIMTContent />}
          {current.id === 'warp' && <WarpContent />}
          {current.id === 'blocks' && <BlockContent />}

          {/* Description */}
          <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, marginTop: '16px' }}>
            {current.content}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={prev} disabled={slide === 0} style={navBtn(slide === 0)}>
          ← Previous
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? '24px' : '8px', height: '8px',
                borderRadius: '999px', border: 'none',
                background: i === slide ? 'var(--accent)' : 'var(--border)',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        <button onClick={next} disabled={slide === SLIDES.length - 1} style={navBtn(slide === SLIDES.length - 1)}>
          Next →
        </button>
      </div>

      <div style={{
        textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '10px',
        color: 'var(--text-muted)',
      }}>
        Slide {slide + 1} of {SLIDES.length}
      </div>
    </div>
  )
}

function navBtn(disabled) {
  return {
    padding: '8px 18px', borderRadius: '8px',
    border: '1px solid var(--border)', background: 'transparent',
    color: disabled ? 'var(--text-muted)' : 'var(--text)',
    fontFamily: 'var(--mono)', fontSize: '11px',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1, transition: 'all 0.2s',
  }
}

function GpuVsCpuContent() {
  const metrics = [
    { label: 'Cores', cpu: '4–16', gpu: '1,000s' },
    { label: 'Cache', cpu: 'Large (MB)', gpu: 'Small (KB)' },
    { label: 'Control', cpu: 'Complex', gpu: 'Minimal' },
    { label: 'Mem BW', cpu: '50–100 GB/s', gpu: '500–900 GB/s' },
  ]

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      {/* CPU diagram */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: '#3b82f6', fontWeight: 600, marginBottom: '6px' }}>CPU</div>
        <svg width="140" height="100" viewBox="0 0 140 100">
          {[0, 1, 2].map(i => (
            <g key={i}>
              <rect x={10 + i * 42} y={10} width={36} height={36} rx={4} fill="#3b82f622" stroke="#3b82f6" strokeWidth="1"/>
              <text x={28 + i * 42} y={32} fill="#3b82f6" fontFamily="var(--mono)" fontSize="8" textAnchor="middle" fontWeight="600">Core</text>
              <rect x={14 + i * 42} y={50} width={28} height={8} rx={2} fill="#3b82f644"/>
              <rect x={14 + i * 42} y={62} width={28} height={8} rx={2} fill="#3b82f644"/>
            </g>
          ))}
        </svg>
      </div>

      {/* VS */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 700, color: 'var(--text-muted)' }}>VS</div>

      {/* GPU diagram */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: '#22c55e', fontWeight: 600, marginBottom: '6px' }}>GPU</div>
        <svg width="180" height="100" viewBox="0 0 200 100">
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={10 + (i % 6) * 28} y={10 + Math.floor(i / 6) * 28} width={22} height={22} rx={3}
              fill="#22c55e22" stroke="#22c55e" strokeWidth="0.8"/>
          ))}
          <text x={100} y={70} fill="#22c55e" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">... more SMs</text>
          <text x={100} y={84} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">× thousands of cores</text>
        </svg>
      </div>

      {/* Metrics table */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        {metrics.map(m => (
          <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: '11px', fontFamily: 'var(--mono)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '9px', minWidth: '50px' }}>{m.label}</span>
            <span style={{ color: '#3b82f6', minWidth: '60px' }}>{m.cpu}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>→</span>
            <span style={{ color: '#22c55e' }}>{m.gpu}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SMContent() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width={SM_DIAGRAM_W} height={SM_DIAGRAM_H} viewBox={`0 0 ${SM_DIAGRAM_W} ${SM_DIAGRAM_H}`}>
        {/* SM boundary */}
        <rect x={60} y={10} width={300} height={200} rx={8} fill="rgba(34, 197, 94, 0.06)" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,2"/>
        <text x={70} y={30} fill="#22c55e" fontFamily="var(--mono)" fontSize="9" fontWeight="600">Streaming Multiprocessor (SM)</text>

        {/* Warp schedulers */}
        {[0, 1].map(i => (
          <rect key={i} x={80 + i * 120} y={40} width={100} height={20} rx={4} fill="#3b82f622" stroke="#3b82f6" strokeWidth="1"/>
        ))}
        <text x={140} y={53} fill="#3b82f6" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">Warp Scheduler</text>
        <text x={260} y={53} fill="#3b82f6" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">Warp Scheduler</text>

        {/* CUDA cores grid */}
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={80 + (i % 4) * 35} y={75 + Math.floor(i / 4) * 28} width={28} height={22} rx={3}
            fill="#22c55e22" stroke="#22c55e" strokeWidth="0.8"/>
        ))}
        <text x={150} y={165} fill="#22c55e" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">CUDA Cores (×128 per SM)</text>

        {/* Shared memory */}
        <rect x={80} y={180} width={200} height={20} rx={4} fill="#f59e0b22" stroke="#f59e0b" strokeWidth="1"/>
        <text x={180} y={193} fill="#f59e0b" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">Shared Memory / L1 Cache</text>
      </svg>
    </div>
  )
}

function SIMTContent() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width="400" height="180" viewBox="0 0 400 180">
        <text x={200} y={20} fill="var(--text-h)" fontFamily="var(--mono)" fontSize="10" fontWeight="600" textAnchor="middle">Warp of 32 Threads</text>

        {/* Instruction broadcast */}
        <rect x={140} y={30} width={120} height={24} rx={4} fill="#8b5cf622" stroke="#8b5cf6" strokeWidth="1"/>
        <text x={200} y={46} fill="#8b5cf6" fontFamily="var(--mono)" fontSize="9" fontWeight="600" textAnchor="middle">Same Instruction</text>

        {/* Arrows down to threads */}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1={20 + i * 48} y1={54} x2={20 + i * 48} y2={72} stroke="#8b5cf6" strokeWidth="0.5" opacity="0.5"/>
        ))}

        {/* Threads */}
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect x={10 + i * 48} y={75} width={40} height={20} rx={3} fill="#22c55e22" stroke="#22c55e" strokeWidth="0.8"/>
            <text x={30 + i * 48} y={89} fill="#22c55e" fontFamily="var(--mono)" fontSize="7" textAnchor="middle">T{i}</text>
          </g>
        ))}

        <text x={200} y={115} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">Each thread operates on different data</text>

        {/* Data elements */}
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={10 + i * 48} y={125} width={40} height={20} rx={3} fill="#f59e0b22" stroke="#f59e0b" strokeWidth="0.8"/>
        ))}
        <text x={200} y={156} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">D₀ D₁ D₂ D₃ D₄ D₅ D₆ D₇ ... D₃₁</text>
      </svg>
    </div>
  )
}

function WarpContent() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width="420" height="180" viewBox="0 0 420 180">
        <text x={210} y={20} fill="var(--text-h)" fontFamily="var(--mono)" fontSize="10" fontWeight="600" textAnchor="middle">Warp Scheduling Timeline</text>

        {[
          { label: 'Warp 0', color: '#3b82f6' },
          { label: 'Warp 1', color: '#22c55e' },
          { label: 'Warp 2', color: '#f59e0b' },
          { label: 'Warp 3', color: '#ef4444' },
        ].map((w, i) => (
          <g key={i}>
            <text x={10} y={48 + i * 30} fill={w.color} fontFamily="var(--mono)" fontSize="8" fontWeight="600">{w.label}</text>
            {[0, 1, 2, 3].map(c => (
              <rect key={c} x={65 + c * 65} y={36 + i * 30} width={60} height={18} rx={3}
                fill={`${w.color}33`} stroke={w.color} strokeWidth="0.8"/>
            ))}
            <text x={95} y={49 + i * 30} fill={w.color} fontFamily="var(--mono)" fontSize="7" textAnchor="middle" fontWeight="600">C{c + 1}</text>
          </g>
        ))}

        {/* Stall indicator */}
        <rect x={65 + 3 * 65} y={36 + 0 * 30} width={60} height={18} rx={3}
          fill="#6b728044" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2"/>

        <text x={210} y={170} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="8" textAnchor="middle">
          When Warp 0 stalls (red hatched), scheduler switches to Warp 1
        </text>
      </svg>
    </div>
  )
}

function BlockContent() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width="400" height="180" viewBox="0 0 400 180">
        <text x={200} y={20} fill="var(--text-h)" fontFamily="var(--mono)" fontSize="10" fontWeight="600" textAnchor="middle">Grid of Thread Blocks</text>

        {/* Grid */}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={30 + (i % 3) * 80} y={40 + Math.floor(i / 3) * 42} width={65} height={32} rx={4}
            fill="#8b5cf622" stroke="#8b5cf6" strokeWidth="0.8"/>
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <text key={i} x={62 + (i % 3) * 80} y={60 + Math.floor(i / 3) * 42}
            fill="#8b5cf6" fontFamily="var(--mono)" fontSize="7" textAnchor="middle" fontWeight="600">
            Block {i}
          </text>
        ))}

        {/* SM assignment arrows */}
        <text x={30} y={155} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="8">SM 0:</text>
        <text x={80} y={155} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="8">Block 0, Block 3, Block 6</text>
        <text x={30} y={170} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="8">SM 1:</text>
        <text x={80} y={170} fill="var(--text-muted)" fontFamily="var(--mono)" fontSize="8">Block 1, Block 4, Block 7</text>
      </svg>
    </div>
  )
}
