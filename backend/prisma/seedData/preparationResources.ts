// prisma/seedData/preparationResources.ts
import { BranchCode, ResourceFormat } from '@prisma/client';

export interface ResourceSeed {
  branchCode: BranchCode;
  semesterNumber: number;
  title: string;
  subject: string;
  topic: string;
  format: ResourceFormat;
  description: string;
  contentUrl?: string;
  contentBody: string;
  fileSize: string;
  pages: number;
  author: string;
  isGatePyq: boolean;
}

export const preparationResourcesData: ResourceSeed[] = [
  // ===================== CSE RESOURCES =====================
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 3,
    title: 'Data Structures Comprehensive Engineering Compendium',
    subject: 'Data Structures & Algorithms',
    topic: 'Trees & Graphs',
    format: ResourceFormat.COMPENDIUM,
    description: 'Complete reference compendium on balanced search trees, heaps, disjoint set union, and graph representations.',
    fileSize: '3.4 MB',
    pages: 42,
    author: 'PrepAI Academic Editorial Board',
    isGatePyq: false,
    contentBody: `# Data Structures & Algorithms Compendium\n\n## 1. Balanced Search Trees\n- AVL Trees: Strictly height-balanced with balance factor in {-1, 0, 1}. Rotations: LL, RR, LR, RL.\n- Red-Black Trees: Color invariants, black height consistency, O(log N) insertion with at most 2 rotations.\n\n## 2. Graph Representations\n- Adjacency Matrix: O(V^2) space, O(1) edge lookup.\n- Adjacency List: O(V + E) space, optimal for sparse graphs.\n- BFS (Queue) vs DFS (Recursion/Stack).`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 5,
    title: 'Operating Systems Kernel & Concurrency Study Notes',
    subject: 'Operating Systems',
    topic: 'Virtual Memory & Scheduling',
    format: ResourceFormat.NOTES,
    description: 'Concise lecture notes covering page replacement algorithms, TLB translation, thread synchronization, and IPC.',
    fileSize: '1.8 MB',
    pages: 28,
    author: 'Prof. R. Sharma (Dept of CSE)',
    isGatePyq: false,
    contentBody: `# Operating Systems Notes\n\n## 1. Virtual Memory Management\n- Multi-level page tables divide virtual addresses into Page Directory, Page Table, and Offset.\n- TLB (Translation Lookaside Buffer): Hardware cache of recent PTEs.\n- Page Replacement: FIFO, LRU, Optimal (Belady), Clock Algorithm.\n\n## 2. Process Synchronization\n- Peterson's Algorithm, Semaphores (wait/signal), Monitors.\n- Deadlock Coffman Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 5,
    title: 'DBMS SQL & Indexing Cheatsheet',
    subject: 'Database Management Systems',
    topic: 'Relational Algebra & Normalization',
    format: ResourceFormat.CHEATSHEET,
    description: 'Quick-reference cheatsheet for SQL query tuning, B+ Tree indexing, ACID transactions, and normalization proofs.',
    fileSize: '850 KB',
    pages: 6,
    author: 'PrepAI Database Working Group',
    isGatePyq: false,
    contentBody: `# DBMS Architecture Cheatsheet\n\n## Normalization Quick Rules\n- 1NF: All column attributes are atomic (no repeating groups).\n- 2NF: 1NF + No partial dependencies on composite primary keys.\n- 3NF: 2NF + No transitive functional dependencies (X -> Y where Y is non-prime).\n- BCNF: For every non-trivial FD X -> Y, X is a superkey.\n\n## Index Tuning\n- B+ Tree seek: O(log_B N) disk I/O.\n- Composite index rule: Leftmost prefix matching.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 6,
    title: 'GATE CSE 2024: Operating Systems & Virtual Memory Solutions',
    subject: 'Operating Systems',
    topic: 'Virtual Memory & Page Tables',
    format: ResourceFormat.GATE_PYQS,
    description: 'Official GATE CSE questions on two-level paging calculations, TLB hit ratios, and effective memory access time (EMAT).',
    fileSize: '2.1 MB',
    pages: 18,
    author: 'GATE CSE Committee / PrepAI Solutions',
    isGatePyq: true,
    contentBody: `# GATE CSE PYQ: Two-Level Paging Calculation\n\n**Problem:** Consider a 32-bit virtual address space with 4 KB page size. Each page table entry (PTE) is 4 bytes. If two-level paging is used, calculate the total size of the outer page directory.\n\n**Solution:**\n1. Page Size = 4 KB = 2^12 bytes -> Offset = 12 bits.\n2. Number of virtual pages = 2^(32-12) = 2^20 pages.\n3. Entries per page table = 4 KB / 4 bytes = 1024 = 2^10 entries.\n4. Outer page directory entries = 2^20 / 2^10 = 2^10 = 1024 entries.\n5. Size of outer page directory = 1024 * 4 bytes = 4 KB.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 6,
    title: 'Computer Networks Protocol Stack & Subnetting MCQs',
    subject: 'Computer Networks',
    topic: 'Transport & Network Layers',
    format: ResourceFormat.NOTES,
    description: '50 selected conceptual MCQs with detailed explanations covering TCP congestion control, sliding window, and CIDR subnetting.',
    fileSize: '1.2 MB',
    pages: 20,
    author: 'PrepAI Networks Faculty',
    isGatePyq: false,
    contentBody: `# Computer Networks MCQs & Solutions\n\n**Q1:** A TCP connection uses 64 KB window with RTT = 20ms. What is maximum theoretical throughput?\n**A1:** Throughput = Window / RTT = 64 * 1024 * 8 / 0.02 = 26.21 Mbps.\n\n**Q2:** What protocol operates at the network layer to translate IP addresses to MAC addresses?\n**A2:** ARP (Address Resolution Protocol).`
  },

  // ===================== ECE RESOURCES =====================
  {
    branchCode: BranchCode.ECE,
    semesterNumber: 4,
    title: 'Digital Electronics & Verilog HDL Design Manual',
    subject: 'Digital System Design',
    topic: 'FSM & Sequential Circuits',
    format: ResourceFormat.COMPENDIUM,
    description: 'Comprehensive guide to Mealy and Moore finite state machines, setup/hold time timing closure, and synthesizable Verilog.',
    fileSize: '4.1 MB',
    pages: 36,
    author: 'Dr. V. K. Murthy (VLSI Design Lab)',
    isGatePyq: false,
    contentBody: `# Digital VLSI & Verilog Guide\n\n## 1. Setup and Hold Time Constraints\n- Setup Time (T_setup): Minimum time data must be stable before the clock edge.\n- Hold Time (T_hold): Minimum time data must remain stable after the clock edge.\n- Slack Equation: T_clk >= T_cq + T_comb + T_setup.\n\n## 2. Mealy vs Moore FSMs\n- Moore machine outputs depend purely on current state.\n- Mealy machine outputs depend on current state and immediate inputs.`
  },
  {
    branchCode: BranchCode.ECE,
    semesterNumber: 5,
    title: 'Signals & Systems Transform Calculus Cheatsheet',
    subject: 'Signals & Systems',
    topic: 'Fourier & Z-Transforms',
    format: ResourceFormat.CHEATSHEET,
    description: 'Formula summary sheet for Continuous and Discrete Fourier Transforms, Laplace ROC conditions, and Z-transform stability.',
    fileSize: '780 KB',
    pages: 5,
    author: 'PrepAI Signal Processing Group',
    isGatePyq: false,
    contentBody: `# Signals & Systems Transform Reference\n\n## Continuous-Time Fourier Transform (CTFT)\n- X(jw) = integral x(t) e^(-jwt) dt\n- Duality property: x(t) <-> X(jw) implies X(t) <-> 2*pi*x(-w)\n\n## Z-Transform Region of Convergence (ROC)\n- LTI system is causal if ROC extends outside outermost pole.\n- LTI system is stable if ROC contains the unit circle |z| = 1.`
  },
  {
    branchCode: BranchCode.ECE,
    semesterNumber: 6,
    title: 'GATE ECE 2024: Microprocessors & Embedded Systems PYQs',
    subject: 'Microprocessors',
    topic: '8086 & ARM Architecture',
    format: ResourceFormat.GATE_PYQS,
    description: 'GATE previous year questions on instruction pipelining, memory segmentation, interrupt handling, and bus timing.',
    fileSize: '2.5 MB',
    pages: 22,
    author: 'GATE ECE Editorial / PrepAI',
    isGatePyq: true,
    contentBody: `# GATE ECE Microprocessors Questions & Solutions\n\n**Problem:** In a 5-stage pipeline (IF, ID, EX, MEM, WB), calculate the speedup factor for 100 instructions assuming no branch hazards or pipeline stalls.\n\n**Solution:**\n- Non-pipelined time = N * k * t = 100 * 5 * t = 500t\n- Pipelined time = (k + N - 1) * t = (5 + 100 - 1) * t = 104t\n- Speedup = 500t / 104t = 4.81x.`
  },

  // ===================== EE RESOURCES =====================
  {
    branchCode: BranchCode.EE,
    semesterNumber: 4,
    title: 'Electrical Machines & Transformers Engineering Guide',
    subject: 'Electrical Machines',
    topic: 'Transformers & Induction Motors',
    format: ResourceFormat.COMPENDIUM,
    description: 'In-depth notes on transformer equivalent circuits, phasor diagrams, open/short circuit tests, and induction motor torque-slip curves.',
    fileSize: '3.8 MB',
    pages: 45,
    author: 'Prof. A. N. Banerjee (Dept of EE)',
    isGatePyq: false,
    contentBody: `# Electrical Machines Comprehensive Notes\n\n## 1. Single-Phase Transformers\n- Core losses: Hysteresis loss (P_h = k_h * f * B_max^1.6) and Eddy current loss (P_e = k_e * f^2 * B_max^2).\n- Open Circuit Test: Conducted on LV side to determine shunt branch parameters (R_c, X_m).\n- Short Circuit Test: Conducted on HV side to determine series parameters (R_eq, X_eq).\n\n## 2. 3-Phase Induction Motors\n- Synchronous Speed: N_s = 120 * f / P.\n- Slip: s = (N_s - N_r) / N_s.\n- Maximum Torque occurs at s_max = R_2 / X_2.`
  },
  {
    branchCode: BranchCode.EE,
    semesterNumber: 6,
    title: 'Control Systems Stability & Frequency Response Cheatsheet',
    subject: 'Control Systems',
    topic: 'Bode Plots & Nyquist Criterion',
    format: ResourceFormat.CHEATSHEET,
    description: 'Summary guide for Routh-Hurwitz criterion, Root Locus rules, Gain/Phase Margin computation, and Nyquist encirclements.',
    fileSize: '920 KB',
    pages: 8,
    author: 'PrepAI Electrical Control Group',
    isGatePyq: false,
    contentBody: `# Control Systems Stability Reference\n\n## Routh-Hurwitz Criterion\n- Necessary condition: All polynomial coefficients must be strictly positive.\n- Number of sign changes in first column equals number of right-half s-plane roots (unstable).\n\n## Bode Plot Stability\n- Gain Margin (GM) = -20 * log10 |G(jw_pc)|\n- Phase Margin (PM) = 180 + angle(G(jw_gc))\n- System is stable if Phase Crossover Frequency w_pc > Gain Crossover Frequency w_gc.`
  },
  {
    branchCode: BranchCode.EE,
    semesterNumber: 6,
    title: 'GATE EE 2024: Power Systems Fault Analysis PYQs',
    subject: 'Power Systems',
    topic: 'Symmetrical Components & Faults',
    format: ResourceFormat.GATE_PYQS,
    description: 'Step-by-step solved GATE questions on positive/negative/zero sequence networks and Single Line-to-Ground (SLG) fault calculations.',
    fileSize: '2.8 MB',
    pages: 24,
    author: 'GATE EE Faculty Board / PrepAI',
    isGatePyq: true,
    contentBody: `# GATE EE Power Systems Fault Solutions\n\n**Problem:** A 3-phase generator with subtransient reactance X1=0.2, X2=0.15, X0=0.05 p.u. experiences a dead short Single Line-to-Ground (SLG) fault. Calculate the subtransient fault current in p.u.\n\n**Solution:**\n- In an SLG fault, sequence networks are connected in series:\n- I_a0 = I_a1 = I_a2 = E_a / (X1 + X2 + X0 + 3*Z_f)\n- With E_a = 1.0 p.u. and Z_f = 0:\n- I_a1 = 1.0 / (0.2 + 0.15 + 0.05) = 1.0 / 0.4 = 2.5 p.u.\n- Fault Current I_f = 3 * I_a1 = 3 * 2.5 = 7.5 p.u.`
  },

  // ===================== ME RESOURCES =====================
  {
    branchCode: BranchCode.ME,
    semesterNumber: 3,
    title: 'Thermodynamics & Heat Engines Fundamentals',
    subject: 'Applied Thermodynamics',
    topic: 'Carnot & Rankine Cycles',
    format: ResourceFormat.COMPENDIUM,
    description: 'Detailed study notes covering the First and Second Laws of Thermodynamics, entropy generation, exergy, and steam power cycles.',
    fileSize: '3.6 MB',
    pages: 38,
    author: 'Dr. H. C. Verma (Thermal Engineering Lab)',
    isGatePyq: false,
    contentBody: `# Applied Thermodynamics Guide\n\n## 1. Laws of Thermodynamics\n- First Law: dQ = dU + dW (conservation of energy).\n- Second Law: Clausius and Kelvin-Planck statements; entropy generation S_gen >= 0 for all real processes.\n\n## 2. Power Cycles\n- Carnot Cycle Efficiency: eta = 1 - T_L / T_H.\n- Rankine Cycle: Reheat and regeneration to prevent moisture in low-pressure turbine stages and increase thermal efficiency.`
  },
  {
    branchCode: BranchCode.ME,
    semesterNumber: 4,
    title: 'Strength of Materials & Beam Deflection Cheatsheet',
    subject: 'Strength of Materials',
    topic: 'Bending & Shear Stress',
    format: ResourceFormat.CHEATSHEET,
    description: 'Formulas and diagrams for Mohr\'s circle, Euler buckling, pure bending equation, and double integration deflection.',
    fileSize: '1.1 MB',
    pages: 7,
    author: 'PrepAI Mechanical Structural Group',
    isGatePyq: false,
    contentBody: `# Strength of Materials Cheatsheet\n\n## Pure Bending Formula\n- sigma / y = M / I = E / R\n  - sigma: Bending stress\n  - M: Bending moment\n  - I: Area moment of inertia\n  - y: Distance from neutral axis\n\n## Mohr's Circle for Plane Stress\n- Principal Stresses: sigma_1,2 = (sigma_x + sigma_y)/2 +/- sqrt(((sigma_x - sigma_y)/2)^2 + tau_xy^2)\n- Maximum Shear Stress: tau_max = (sigma_1 - sigma_2) / 2`
  },
  {
    branchCode: BranchCode.ME,
    semesterNumber: 6,
    title: 'GATE ME 2024: Fluid Mechanics & Turbomachinery PYQs',
    subject: 'Fluid Mechanics',
    topic: 'Bernoulli Equation & Boundary Layer',
    format: ResourceFormat.GATE_PYQS,
    description: 'Official GATE ME previous year questions on Navier-Stokes simplifications, pipe friction factor (Moody diagram), and boundary layer thickness.',
    fileSize: '2.6 MB',
    pages: 20,
    author: 'GATE ME Review Board / PrepAI',
    isGatePyq: true,
    contentBody: `# GATE ME Fluid Mechanics Solutions\n\n**Problem:** Water flows through a horizontal pipe of diameter D = 0.1 m at average velocity V = 2 m/s. If friction factor f = 0.02, calculate head loss over length L = 50 m.\n\n**Solution:**\n- Darcy-Weisbach Equation: h_f = (f * L * V^2) / (2 * g * D)\n- h_f = (0.02 * 50 * 2^2) / (2 * 9.81 * 0.1)\n- h_f = (0.02 * 50 * 4) / (1.962) = 4 / 1.962 = 2.038 meters.`
  }
];
