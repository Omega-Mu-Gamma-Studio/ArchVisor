/**
 * Fun facts displayed on each sub-tool page.
 * Keyed by unit ID (1–5), each containing an array of fact strings.
 */
const FUN_FACTS = {
  1: [
    'The first computer bug was an actual bug. In 1947, Grace Hopper\'s team found a moth stuck in a relay of the Harvard Mark II computer. They taped it into the logbook with the note "First actual case of bug being found" — and that\'s how we got the term "debugging."',
    'MIPS stands for "Microprocessor without Interlocked Pipeline Stages" — a name that literally brags about its lack of pipeline hazards. The irony? Modern MIPS implementations absolutely have pipeline interlocks, but the name stuck.',
    'A single modern CPU register can be accessed in under 0.3 nanoseconds — that\'s about the time it takes light to travel just 9 centimeters. In that same time, accessing main memory would only get you about 1 meter of light travel. The speed gap is why we have caches.',
    'The ARM architecture that powers your phone started as a rejected design. Acorn Computers wanted a processor for their new machine, but Intel and Motorola turned them down. So a small team designed their own — the Acorn RISC Machine — which evolved into ARM, now in over 250 billion chips worldwide.',
  ],
  2: [
    'The Pentium FDIV bug of 1994 cost Intel $475 million. A tiny error in the floating-point division lookup table caused incorrect results for certain number pairs. Intel initially dismissed it as too rare to matter, but a math professor discovered it while doing prime number research. Intel had to recall every chip.',
    'Andrew Booth invented Booth\'s Algorithm in 1951 while studying crystallography. He wasn\'t a computer architect — he was trying to solve physics problems and needed faster multiplication on the slow computers of his day. His algorithm reduced the number of additions by half on average.',
    'The number 0.1 cannot be represented exactly in IEEE 754 binary floating-point. Just like 1/3 cannot be exactly represented in decimal, 0.1 becomes a repeating fraction in binary. This is why 0.1 + 0.2 !== 0.3 in JavaScript and most programming languages.',
    'NASA\'s 1998 Mars Climate Orbiter crashed because of a unit conversion error. One team used metric units, another used imperial. The $327 million spacecraft burned up in Mars\' atmosphere. Modern IEEE 754 standards help prevent the kind of ambiguity that contributed to this disaster.',
    'The fastest multiplication in history might be the carry-save multiplier. Instead of waiting for carries to ripple through, it saves them for the final addition — like doing all the partial products at once and settling the bill at the very end.',
  ],
  3: [
    'The MIPS pipeline was inspired by laundry. One of the textbook authors described pipelining by imagining four people doing laundry with one washer and one dryer. If you start a new load before the previous one is completely done, you get clean clothes faster — even though each individual load takes the same time.',
    'The Cray-1 supercomputer (1976) had a strange round shape — not for looks, but to keep wires short. Cray arranged the boards in a 270-degree arc around a central core, minimizing wire length to reduce signal propagation delay. The circular bench seat was actually a clever disguise for the cooling system.',
    'Hazard detection is like traffic control. A RAW hazard is like one car needing a parking spot that another car hasn\'t vacated yet. Forwarding (bypassing) is like handing the keys directly through the window instead of waiting for the driver to park and get out.',
    'The world\'s first superscalar processor was the IBM POWER1 in 1990. It could issue up to 4 instructions per cycle — but achieving that peak throughput required carefully scheduled code. Compiler optimizations for superscalar execution remain an active research area 35+ years later.',
  ],
  4: [
    'The world\'s largest supercomputer, Frontier (2024), has over 8.7 million cores. It can perform over 1.2 exaflops — that\'s 1.2 quintillion floating-point operations per second. If every person on Earth did one calculation per second, it would take humanity over 4.5 years to do what Frontier does in one second.',
    'Flynn\'s Taxonomy was proposed in 1966, and the MISD category has almost no real-world examples. Some argue that systolic arrays or pipelined vector processors qualify, but it\'s largely a theoretical category. Even Michael Flynn himself reportedly joked that MISD was included "just to complete the matrix."',
    'The "cache coherence" problem is like group chat syncing. When you send a message in a group chat, everyone\'s phone needs to update. If two people edit the same message at the same time, you get a conflict — similar to two cores writing to the same cache line. The MESI protocol is basically a well-behaved group chat rulebook.',
    'Modern GPUs have tens of thousands of threads in flight simultaneously. An NVIDIA H100 GPU can manage over 32,000 threads at once — but they execute in lockstep groups of 32 called "warps." If one thread in a warp takes a different branch path, the rest of the warp stalls and waits.',
  ],
  5: [
    'If CPU speed is a human\'s running pace (15 mph), then L1 cache access is like picking something from your pocket, RAM access is like running to the grocery store, and SSD access is like running across the country. The gap between processor speed and memory latency is the single biggest performance bottleneck in modern computing.',
    'Early hard drives (1956) stored 5 MB on a stack of 50 disks weighing over a ton. The IBM 305 RAMAC leased for about $3,200/month. That\'s about $7,000 per megabyte per month. Today, 1 TB of storage costs under $50 retail — that\'s $0.00005 per megabyte.',
    'USB stands for "Universal Serial Bus" — but "universal" almost didn\'t happen. In the early 1990s, computers had separate ports for keyboards, mice, printers, and more. Intel\'s Ajay Bhatt led the USB initiative specifically to end the "port chaos." USB is now the most successful interface standard in computing history, with over 10 billion ports shipped.',
    'The term "cache" comes from the French word "cacher" meaning "to hide." In computing, caches hide the latency of slower memory by keeping frequently accessed data close to the processor — a concept that\'s been central to computer architecture since the 1960s.',
  ],
}

export default FUN_FACTS
