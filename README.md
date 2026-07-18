# 🖥️ ArchVisor

> **An interactive Computer Organization & Architecture learning platform — built for CS22304.**
> Part of the [Omega Mu Gamma Studio](https://github.com/Omega-Mu-Gamma-Studio) open-source CS education toolkit.

---

## 📌 Overview

**ArchVisor** is a web-based, all-in-one interactive learning platform covering the full CS22304 — Computer Organization and Architecture syllabus. It gives students hands-on simulators, step-by-step visualizers, and animated explainers across all five units of the course — from MIPS instruction encoding and binary arithmetic, all the way to pipeline hazard detection, cache simulation, and virtual memory translation.

The name *ArchVisor* carries a dual meaning: a **visor** you look through to see inside the machine, and a **supervisor** — a systems-level term that reflects the scope of what this tool covers.

ArchVisor is the sixth major project released under Omega Mu Gamma Studio, joining [SeeDS](https://see-ds.vercel.app), [Java-Chan](https://java-chan.vercel.app), [GateLab](https://github.com/Omega-Mu-Gamma-Studio/GateLab), [KMapX](https://kmapx.vercel.app/), and [EG Suite](https://eg-suite.vercel.app/) as part of the studio's growing suite of open-source engineering education tools.

**Status: MVP complete.** All 23 planned sub-tools across 5 units are built and wired into the app shell. See [Known Issues](#-known-issues) below before you call it release-ready.

---

## 🎯 Course Context

| Field | Details |
|---|---|
| **Course Code** | CS22304 |
| **Course Name** | Computer Organization and Architecture |
| **Credits** | L T P C — 3 0 0 3 |
| **Total Periods** | 45 |
| **Textbooks** | Patterson & Hennessy (5th Ed.), Hamacher et al. (6th Ed.) |

---

## ✨ Features

ArchVisor is a **dashboard shell** with **five unit modules**, each containing dedicated sub-tools. All **23 sub-tools** shipped in the MVP.

---

### 🔷 Unit I — Basic Structure of a Computer System

| Sub-tool | Description |
|---|---|
| **1.1 Computer Anatomy Explorer** | Interactive diagram of a computer's functional units (CU, ALU, Memory, I/O). Click any component to animate data flow through it along buses. |
| **1.2 MIPS Instruction Encoder / Decoder** | Encode: type a MIPS assembly instruction → get a color-coded R/I/J format bit-field breakdown. Decode: paste a 32-bit binary/hex string → get the labeled fields and human-readable assembly. |
| **1.3 Register File Viewer** | Live display of all 32 MIPS general-purpose registers with ABI names, values, and write-flash animations. Linked to the Mini-Executor. |
| **1.4 MIPS Mini-Executor** | A miniature MIPS interpreter. Write a sequence of MIPS instructions, step through execution one instruction at a time, and watch the register file update live. Supports: `add, sub, and, or, nor, slt, addi, andi, ori, lw, sw, beq, bne, j, jr, jal`. |

---

### 🔷 Unit II — Arithmetic for Computers

| Sub-tool | Description |
|---|---|
| **2.1 Binary Adder / Subtractor** | Enter two integers → see full binary column addition with carry bits, overflow detection, and 2's complement conversion for subtraction. Step-by-step breakdown available. |
| **2.2 Booth's Multiplication Visualizer** | Step through Booth's Algorithm iteration by iteration. Shows Accumulator / Q / Q-1 state at each step, the operation taken, and the arithmetic right shift. |
| **2.3 Restoring Division Visualizer** | Step through restoring division — partial remainder, subtraction attempt, restore-if-negative logic, quotient bit setting, and final quotient + remainder. |
| **2.4 IEEE 754 Floating Point Explorer** | Converter mode: decimal → IEEE 754 bit layout (sign, biased exponent, mantissa) with step-by-step breakdown. Operation mode: walk through floating point addition/subtraction including exponent alignment, mantissa operation, normalization, and rounding. |
| **2.5 Subword Parallelism Demo** | Visual illustration of packing multiple values into one register and operating on all lanes simultaneously (SIMD-style). |

---

### 🔷 Unit III — Processor and Control Unit

| Sub-tool | Description |
|---|---|
| **3.1 MIPS Datapath Viewer** | Interactive labeled diagram of the full 5-stage MIPS datapath — MUXes, register file, ALU, data memory, pipeline registers (IF/ID, ID/EX, EX/MEM, MEM/WB), and control signals. Hover/click to explore each stage. |
| **3.2 Pipeline Diagram Animator ⭐** | The flagship tool. Enter a MIPS instruction sequence → get a classic pipeline timing diagram (instruction × cycle grid) animated cycle by cycle. Shows stall bubbles, forwarding paths, hazard annotations, CPI, and total cycle count. Supports without-forwarding and with-forwarding modes side by side. |
| **3.3 Hazard Classifier** | Static analysis of a MIPS instruction sequence. Produces a color-coded hazard report: RAW (red), WAW (orange), WAR (yellow), control (purple), structural (blue) — with the instruction pairs, cycle location, and resolution strategy listed. |
| **3.4 Superscalar Comparator** | Side-by-side pipeline diagrams: scalar vs. 2-issue superscalar on the same instruction stream. Shows IPC and speedup ratio. |

---

### 🔷 Unit IV — Parallelism

| Sub-tool | Description |
|---|---|
| **4.1 Flynn's Taxonomy Explorer** | Clickable 2×2 quadrant diagram (SISD / SIMD / MIMD / MISD). Each quadrant animates an example of that execution model with instruction and data stream illustrations and real-world examples. |
| **4.2 Multithreading Visualizer** | Timeline-based visualization of coarse-grained, fine-grained, and SMT/hyperthreading. Configure thread count and stall frequency — see CPU utilization and idle slot patterns. |
| **4.3 Cache Coherence Explorer** | Walk through read/write memory events across 2–4 cores with MESI protocol state machine. Each event shows cache line state transitions (Invalid / Shared / Exclusive / Modified) per core. |
| **4.4 GPU Architecture Explainer** | Illustrated guided tour of GPU architecture — Streaming Multiprocessors, SIMT execution, warp scheduling, thread block grids. Contrasts with CPU execution model. |
| **4.5 Cluster & Message-Passing Overview** | Illustrated overview of clusters, warehouse-scale computing (WSC), and message-passing architectures with an animated MPI-style send/receive example. |

---

### 🔷 Unit V — Memory & I/O Systems

| Sub-tool | Description |
|---|---|
| **5.1 Memory Hierarchy Visualizer** | The classic pyramid — Registers → L1 → L2 → L3 → DRAM → Storage — with latency numbers and capacity ranges. Animates a memory access traveling down and back up the hierarchy. |
| **5.2 Cache Simulator ⭐** | Fully configurable cache simulator. Set cache size, block size, associativity (direct-mapped / N-way / fully associative), replacement policy (LRU / FIFO / Random), and write policy (write-through / write-back). Enter a reference string → step through hits and misses with live cache state, hit rate, and miss rate. |
| **5.3 Virtual Memory & TLB Explorer** | Enter a virtual address → step through VPN/offset decomposition, TLB lookup (hit or miss), page table walk (2-level), and physical address assembly. Configurable page size, TLB entries, and page table entries. |
| **5.4 I/O Methods Comparator** | Side-by-side animated timelines of Programmed I/O, Interrupt-Driven I/O, and DMA. Shows CPU activity, device activity, memory bus usage, and CPU utilization for each method. |
| **5.5 USB Overview Panel** | Illustrated walkthrough of USB topology, enumeration sequence, transfer types (control / bulk / interrupt / isochronous), and an animated packet transfer. |

---

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | React 19 + Vite 8 | Fast dev server, clean build, consistent with studio stack |
| **State Management** | Zustand 5 | Lightweight slice-based state for independent simulation contexts |
| **Styling** | Tailwind CSS 4 (via `@tailwindcss/vite`) | Utility-first, no separate config file — plugin-driven |
| **Animation** | Framer Motion 12 | Component transitions, step reveals, register flash animations |
| **Network/Node Diagrams** | React Flow 11 | Datapath viewer, anatomy explorer, cache coherence diagram |
| **Data-Driven SVG** | D3.js 7 | Pipeline timing grid, cache state table, memory hierarchy, multithreading timeline |
| **Custom SVG Components** | Hand-crafted React SVG | Bit-field renderers (MIPS encoding, IEEE 754, virtual address), Flynn's quadrant, USB diagrams |
| **Code Editor** | CodeMirror 6 | MIPS assembly input with syntax highlighting for sub-tools 1.4 and 3.2 |
| **Routing** | React Router v7 | Unit-level and sub-tool-level nested routing |
| **Simulation Logic** | Vanilla JS (no library) | Pure functions for Booth's, restoring division, IEEE 754, cache math, MIPS interpreter, pipeline engine, TLB |

> All simulation engines are written as **pure JavaScript functions** in `src/engines/`, completely decoupled from React. This keeps them testable in isolation and allows clean step-state capture for animated walkthroughs.

---

## 🗂️ Folder Structure

```
ArchVisor/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── shell/                  # TopBar, Sidebar
│   │   └── shared/                 # BitFieldRenderer, StepControls, PipelineGrid, HazardBadge
│   ├── units/
│   │   ├── unit1/                  # AnatomyExplorer, InstructionEncoder, RegisterFileViewer, MIPSExecutor
│   │   ├── unit2/                  # BinaryAdder, BoothMultiplier, RestoringDivision, IEEE754Explorer, SubwordDemo
│   │   ├── unit3/                  # DatapathViewer, PipelineAnimator, HazardClassifier, SuperscalarComparator
│   │   ├── unit4/                  # FlynnTaxonomy, MultithreadingVisualizer, CacheCoherence, GPUExplainer, ClusterOverview
│   │   └── unit5/                  # MemoryHierarchy, CacheSimulator, VirtualMemoryExplorer, IOComparator, USBOverview
│   ├── engines/                    # Pure JS simulation logic (no React)
│   │   ├── mipsInterpreter.js
│   │   ├── pipelineEngine.js
│   │   ├── cacheSimulator.js
│   │   ├── ieee754.js
│   │   ├── booth.js
│   │   ├── restoringDivision.js
│   │   ├── binaryArithmetic.js
│   │   └── tlb.js
│   ├── store/                      # Zustand slices
│   │   ├── navigationStore.js
│   │   ├── mipsStore.js
│   │   ├── pipelineStore.js
│   │   └── cacheStore.js
│   ├── pages/                      # Home, UnitPage, ToolPage (route-level components)
│   ├── styles/
│   ├── App.jsx                     # Router root, layout shell
│   └── main.jsx
├── index.html
├── vite.config.js
├── eslint.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Omega-Mu-Gamma-Studio/ArchVisor.git
cd ArchVisor

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## ⚠️ Known Issues

These turned up in a lint/build pass on the current MVP — flagging so they get fixed before this ships beyond testing:

- **`ClusterOverview.jsx` (Unit 4.5)** — the MPI section's "next" button calls `setPhase((p + 1) % 4)`, but `p` is undefined (should be `phase`). This throws when clicked.
- **`GPUExplainer.jsx` (Unit 4.4)** — the warp grid's cell label (`C{c + 1}`) references `c` outside the `.map()` scope that defines it. This throws on render of that label.
- **Bundle size** — the production build is a single ~1.1 MB JS chunk (326 KB gzipped). Worth splitting per-tool with `React.lazy` given there are 23 sub-tools, most of which aren't needed on initial load.
- **Lint** — `npm run lint` currently reports 43 issues (mostly unused imports/variables, one `Math.random()`-during-render purity warning in `MultithreadingVisualizer.jsx`). Worth a cleanup pass before merging further features.

---

## 🧑‍💻 Contributing

ArchVisor is an open-source project under Omega Mu Gamma Studio. Contributions, bug reports, and feature suggestions are welcome — open an issue or PR on the repo.

**Studio Lead & Project Founder:** [Alberto Felix](https://github.com/albertofelix08)
**Co-Lead:** [Aaron](https://github.com/aaronmcgeo)

---

## 📚 References

This tool is built around the following course textbooks:

1. David A. Patterson and John L. Hennessy, *Computer Organization and Design: The Hardware/Software Interface*, 5th Edition, Morgan Kaufmann / Elsevier, 2014.
2. Carl Hamacher, Zvonko Vranesic, Safwat Zaky and Naraig Manjikian, *Computer Organization and Embedded Systems*, 6th Edition, Tata McGraw Hill, 2012.
3. William Stallings, *Computer Organization and Architecture: Designing for Performance*, 8th Edition, Pearson Education, 2010.

---

## 📄 License

**PolyForm Noncommercial License 1.0.0** — see [LICENSE](./LICENSE) for full terms. This is **not** MIT: noncommercial use only.

---

<div align="center">

**Omega Mu Gamma Studio** · Open-source CS education tools · [github.com/Omega-Mu-Gamma-Studio](https://github.com/Omega-Mu-Gamma-Studio)

</div>
