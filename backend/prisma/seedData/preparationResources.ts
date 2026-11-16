// prisma/seedData/preparationResources.ts
import { BranchCode, Difficulty, ResourceFormat } from '@prisma/client';

export interface ResourceSeed {
  branchCode: BranchCode;
  semesterNumber: number;
  title: string;
  subject: string;
  topic: string;
  format: ResourceFormat;
  difficulty: Difficulty;
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
    title: 'Data Structures & Algorithms: Balanced Trees & Heaps Compendium',
    subject: 'Data Structures and Algorithms',
    topic: 'Trees, Heaps & Disjoint Sets',
    format: ResourceFormat.COMPENDIUM,
    difficulty: Difficulty.MEDIUM,
    description: 'Complete reference compendium on AVL trees, Red-Black tree invariants, binary max/min heaps, and Union-Find with path compression.',
    fileSize: '3.4 MB',
    pages: 42,
    author: 'PrepAI Academic Editorial Board',
    isGatePyq: false,
    contentBody: `# Data Structures & Algorithms Compendium\n\n## 1. Balanced Search Trees\n- **AVL Trees**: Strictly height-balanced where $|h_L - h_R| \\le 1$. Rebalancing requires single (LL, RR) or double (LR, RL) rotations. O(log N) search, insert, and delete.\n- **Red-Black Trees**: Approximate height balance with maximum depth $2 \\times \\text{min depth}$. Invariants:\n  1. Every node is red or black.\n  2. The root is black.\n  3. No two consecutive red nodes (red parent cannot have red child).\n  4. Every path from root to null leaf contains equal black nodes (black height).\n\n## 2. Priority Queues & Heaps\n- Complete binary tree represented as an array (left child: $2i+1$, right child: $2i+2$, parent: $\\lfloor(i-1)/2\\rfloor$).\n- Heapify operation takes $O(N)$ time built bottom-up, not $O(N \\log N)$.\n\n## 3. Disjoint Set Union (DSU)\n- Near $O(\\alpha(N))$ query time using rank-based union combined with recursive path compression.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 3,
    title: 'DSA Standard Interview MCQs & Time Complexity Diagnostic',
    subject: 'Data Structures and Algorithms',
    topic: 'Asymptotic Analysis & Recursion Trees',
    format: ResourceFormat.MCQ,
    difficulty: Difficulty.EASY,
    description: '45 curated conceptual multiple-choice questions testing Big-O notation, master theorem cases, and amortized complexity.',
    fileSize: '950 KB',
    pages: 12,
    author: 'PrepAI CS Evaluation Team',
    isGatePyq: false,
    contentBody: `# Data Structures & Algorithms Diagnostic MCQs\n\n**Q1:** What is the worst-case time complexity of finding the median in an unsorted array of size $N$ using Median-of-Medians?\n- A) $O(N \\log N)$\n- B) $O(N)$\n- C) $O(N^2)$\n- D) $O(\\log N)$\n*Answer:* **B) $O(N)$**. Median-of-medians guarantees a 30-70 split in linear deterministic time.\n\n**Q2:** Master Theorem case for $T(N) = 2T(N/2) + N \\log N$:\n- A) Case 1\n- B) Case 2 extended\n- C) Case 3\n- D) Master Theorem does not apply\n*Answer:* **B) Case 2 Extended** giving $\\Theta(N \\log^2 N)$.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 4,
    title: 'Computer Organization & Architecture: Pipelining & Cache Mapping',
    subject: 'Computer Organization and Architecture',
    topic: 'Instruction Pipelining & Memory Hierarchy',
    format: ResourceFormat.NOTES,
    difficulty: Difficulty.HARD,
    description: 'Detailed analysis of 5-stage RISC pipelines, structural/data/control hazards, forwarding paths, and Set-Associative cache mapping mathematics.',
    fileSize: '2.5 MB',
    pages: 34,
    author: 'Prof. S. K. Mitra (Dept. of CSE)',
    isGatePyq: false,
    contentBody: `# Computer Organization & Architecture Guide\n\n## 1. Classical 5-Stage RISC Pipeline\nStages: **IF (Instruction Fetch)**, **ID (Instruction Decode)**, **EX (Execute)**, **MEM (Memory Access)**, **WB (Write Back)**.\n\n### Pipeline Hazards\n1. **Structural Hazards**: Hardware resource conflict (e.g., single memory port for both instructions and data).\n2. **Data Hazards**: RAW (Read After Write), WAR (Write After Read), WAW (Write After Write). Forwarding (bypassing) mitigates RAW without stalls for ALU operations.\n3. **Control Hazards**: Branch outcome delay. Mitigated by dynamic branch prediction (2-bit saturating counters, tournament predictors).\n\n## 2. Cache Mapping\n- **Direct Mapped**: Cache line index = $(\\text{Block Address}) \\bmod (\\text{Number of Lines})$.\n- **Set Associative**: Memory address split into Tag, Set Index, and Block Offset.\n  - $\\text{Set Index Bits} = \\log_2(\\text{Number of Sets})$.\n  - $\\text{Offset Bits} = \\log_2(\\text{Block Size in Bytes})$.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 4,
    title: 'Object-Oriented Programming & SOLID Principles Master Notes',
    subject: 'Object-Oriented Programming',
    topic: 'Polymorphism, Design Patterns & Clean Architecture',
    format: ResourceFormat.CONCEPT,
    difficulty: Difficulty.MEDIUM,
    description: 'In-depth breakdown of virtual method tables (vtable), dynamic dispatch, abstract base classes, and complete GoF design pattern implementations.',
    fileSize: '2.1 MB',
    pages: 26,
    author: 'PrepAI Architecture Guild',
    isGatePyq: false,
    contentBody: `# Object-Oriented Programming Architecture\n\n## 1. Core Principles\n- **Encapsulation**: Bundling state and operations while hiding internal representation via visibility modifiers.\n- **Inheritance vs Composition**: Favor object composition over class inheritance to prevent fragile base class hierarchies.\n- **Polymorphism**: Compile-time (function overloading, templates) vs Run-time (virtual functions, dynamic dispatch via vtable pointer).\n\n## 2. SOLID Design Guidelines\n- **S**: Single Responsibility Principle - a class should have one and only one reason to change.\n- **O**: Open/Closed Principle - open for extension, closed for modification.\n- **L**: Liskov Substitution Principle - derived classes must be substitutable for their base types without altering correctness.\n- **I**: Interface Segregation Principle - client-specific interfaces rather than bloated monolithic contracts.\n- **D**: Dependency Inversion Principle - depend on abstractions rather than concrete implementations.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 5,
    title: 'Operating Systems Kernel & Concurrency Study Notes',
    subject: 'Operating Systems',
    topic: 'Virtual Memory & Scheduling',
    format: ResourceFormat.NOTES,
    difficulty: Difficulty.MEDIUM,
    description: 'Concise lecture notes covering multi-level page tables, TLB shootdown, thread synchronization primitives, and lock-free algorithms.',
    fileSize: '1.8 MB',
    pages: 28,
    author: 'Prof. R. Sharma (Dept of CSE)',
    isGatePyq: false,
    contentBody: `# Operating Systems Notes\n\n## 1. Virtual Memory Management\n- Multi-level page tables divide virtual addresses into Page Directory, Page Table, and Offset.\n- TLB (Translation Lookaside Buffer): Hardware associative cache of recent Virtual-to-Physical translations.\n- Page Replacement: FIFO, LRU, Optimal (Belady), Clock Algorithm.\n\n## 2. Process Synchronization\n- Peterson's Algorithm, Semaphores (wait/signal), Monitors.\n- Deadlock Coffman Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.\n- Banker's Algorithm for deadlock avoidance using resource-allocation graphs.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 5,
    title: 'DBMS SQL & Indexing Cheatsheet & Query Tuning',
    subject: 'DBMS',
    topic: 'Relational Algebra & Normalization',
    format: ResourceFormat.CHEATSHEET,
    difficulty: Difficulty.EASY,
    description: 'Quick-reference cheatsheet for SQL query tuning, B+ Tree indexing, ACID transactions, and normalization proofs.',
    fileSize: '850 KB',
    pages: 6,
    author: 'PrepAI Database Working Group',
    isGatePyq: false,
    contentBody: `# DBMS Architecture Cheatsheet\n\n## Normalization Quick Rules\n- **1NF**: All column attributes are atomic (no repeating groups).\n- **2NF**: 1NF + No partial dependencies on composite primary keys.\n- **3NF**: 2NF + No transitive functional dependencies ($X \\to Y$ where $Y$ is non-prime and $X$ is not a superkey).\n- **BCNF**: For every non-trivial FD $X \\to Y$, $X$ must be a superkey.\n\n## Index Tuning\n- B+ Tree seek: $O(\\log_B N)$ disk I/O.\n- Composite index rule: Leftmost prefix matching. An index on $(A, B, C)$ serves queries on $(A)$, $(A, B)$, and $(A, B, C)$, but NOT $(B)$ or $(C)$ alone.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 6,
    title: 'Computer Networks Protocol Suite & Socket Architecture',
    subject: 'Computer Networks',
    topic: 'TCP Congestion Control & Routing Protocols',
    format: ResourceFormat.NOTES,
    difficulty: Difficulty.MEDIUM,
    description: 'Complete breakdown of TCP 3-way handshake, sliding window flow control, congestion algorithms (Reno, Cubic), and routing protocols (OSPF, BGP).',
    fileSize: '3.1 MB',
    pages: 36,
    author: 'PrepAI Network Infrastructure Team',
    isGatePyq: false,
    contentBody: `# Computer Networks Protocol Suite\n\n## 1. Transport Layer Protocols\n### TCP vs UDP\n- **TCP**: Connection-oriented, full-duplex, byte-stream, reliable with sequence numbers and ACKs.\n- **TCP 3-Way Handshake**: SYN ($seq=x$) $\\to$ SYN-ACK ($seq=y, ack=x+1$) $\\to$ ACK ($ack=y+1$).\n- **TCP Congestion Control**: Slow Start ($CWND$ doubles every RTT until $ssthresh$), Congestion Avoidance (additive increase by 1 MSS/RTT), Fast Retransmit (3 duplicate ACKs), Fast Recovery.\n\n## 2. Network Routing Protocols\n- **Distance Vector (Bellman-Ford)**: Exchanges entire routing table with neighbors; suffers from count-to-infinity.\n- **Link State (Dijkstra - OSPF)**: Floods link state advertisements (LSAs) and builds topological graph of autonomous system.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 6,
    title: 'Software Engineering Design Patterns & Agile CI/CD Notes',
    subject: 'Software Engineering',
    topic: 'Architecture Styles & Refactoring',
    format: ResourceFormat.TUTORIAL,
    difficulty: Difficulty.EASY,
    description: 'Practical guide to Microservices vs Monolith trade-offs, Test-Driven Development (TDD), CI/CD pipelines, and Scrum workflows.',
    fileSize: '1.5 MB',
    pages: 20,
    author: 'Lead SDE Mentors / PrepAI',
    isGatePyq: false,
    contentBody: `# Software Engineering Best Practices\n\n## 1. Architectural Styles\n- **Modular Monolith**: Single deployable unit with strictly enforced module boundaries.\n- **Microservices**: Independent deployability, decentralized data ownership, polyglot persistence at the cost of network latency and distributed transaction complexities (Saga pattern).\n\n## 2. Quality Assurance & CI/CD\n- Test Pyramid: High volume unit tests $\\to$ Integration tests $\\to$ Targeted End-to-End tests.\n- Semantic Versioning: MAJOR.MINOR.PATCH (Breaking.Feature.Bugfix).`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 6,
    title: 'Theory of Computation: Automata, Grammars & Decidability',
    subject: 'Theory of Computation',
    topic: 'Chomsky Hierarchy & Turing Machines',
    format: ResourceFormat.COMPENDIUM,
    difficulty: Difficulty.HARD,
    description: 'Formal proofs for pumping lemma for regular and context-free languages, closure properties, and reduction of the Halting Problem.',
    fileSize: '2.9 MB',
    pages: 40,
    author: 'Prof. A. N. Sengupta (Formal Methods Lab)',
    isGatePyq: false,
    contentBody: `# Theory of Computation Compendium\n\n## 1. Chomsky Hierarchy\n- **Type 3 (Regular Languages)**: Finite Automata (DFA/NFA), Regular Expressions.\n- **Type 2 (Context-Free Languages)**: Pushdown Automata (PDA), Context-Free Grammars.\n- **Type 1 (Context-Sensitive Languages)**: Linear Bounded Automata.\n- **Type 0 (Recursively Enumerable)**: Turing Machines.\n\n## 2. Pumping Lemma for Regular Languages\nFor any regular language $L$, there exists pumping length $p$ such that any string $s \\in L$ with $|s| \\ge p$ can be written as $s = xyz$ satisfying:\n1. $|y| > 0$\n2. $|xy| \\le p$\n3. $\\forall i \\ge 0, xy^i z \\in L$`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 7,
    title: 'Compiler Design: Lexical Analysis, LL(1) & LR Parsing',
    subject: 'Compiler Design',
    topic: 'Parser Tables & Syntax-Directed Translation',
    format: ResourceFormat.NOTES,
    difficulty: Difficulty.HARD,
    description: 'Step-by-step calculation of FIRST & FOLLOW sets, LL(1) parse table construction, and shift-reduce LR(0)/SLR(1)/LALR conflict resolution.',
    fileSize: '2.4 MB',
    pages: 32,
    author: 'Compiler Engineering Group',
    isGatePyq: false,
    contentBody: `# Compiler Design Lecture Notes\n\n## 1. Phases of a Compiler\n1. **Lexical Analysis (Scanner)**: Converts character stream into tokens (regular expressions $\\to$ DFA).\n2. **Syntax Analysis (Parser)**: Builds parse tree/AST conforming to CFG.\n3. **Semantic Analysis**: Type checking, scope resolution, symbol table management.\n4. **Intermediate Code Generation**: 3-Address Code (3AC), Static Single Assignment (SSA).\n5. **Optimization**: Dead code elimination, loop unrolling, constant propagation.\n6. **Target Code Generation**: Register allocation via graph coloring.\n\n## 2. Top-Down vs Bottom-Up Parsing\n- **LL(1)**: Left-to-right, Leftmost derivation with 1 lookahead token. Non-ambiguous, no left recursion permitted.\n- **LR(1)**: Left-to-right, Rightmost derivation in reverse with 1 lookahead. Handles broader grammar class than LL(1).`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 7,
    title: 'Artificial Intelligence: Heuristic Search & Constraint Satisfaction',
    subject: 'Artificial Intelligence',
    topic: 'A* Search, Minimax & Alpha-Beta Pruning',
    format: ResourceFormat.CONCEPT,
    difficulty: Difficulty.MEDIUM,
    description: 'Heuristic evaluation functions, admissible and consistent criteria for A* search, adversarial game trees with alpha-beta pruning algorithms.',
    fileSize: '1.9 MB',
    pages: 25,
    author: 'AI Research Lab / PrepAI',
    isGatePyq: false,
    contentBody: `# Artificial Intelligence Notes\n\n## 1. Informed Heuristic Search\n- **A* Algorithm**: Evaluates nodes via $f(n) = g(n) + h(n)$ where $g(n)$ is true cost from start and $h(n)$ is heuristic estimate to goal.\n- **Admissibility**: $h(n) \\le h^*(n)$ for all $n$ (never overestimates). Guarantees optimal path in tree search.\n- **Consistency (Monotonicity)**: $h(n) \\le c(n, a, n') + h(n')$. Guarantees first expansion of a node is its shortest path in graph search.\n\n## 2. Adversarial Search\n- **Minimax**: Optimal strategy for zero-sum 2-player games.\n- **Alpha-Beta Pruning**: Prunes branches that cannot influence the final decision. Best case time complexity drops from $O(b^d)$ to $O(b^{d/2})$.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 7,
    title: 'Machine Learning: Core Algorithms & Mathematical Foundations',
    subject: 'Machine Learning',
    topic: 'Supervised Learning & Backpropagation',
    format: ResourceFormat.FORMULAS,
    difficulty: Difficulty.HARD,
    description: 'Mathematical derivation of Ordinary Least Squares, Logistic Regression log-odds, Support Vector Machine margin duality, and Neural Network gradients.',
    fileSize: '2.8 MB',
    pages: 35,
    author: 'Dr. K. Raman (Machine Intelligence Group)',
    isGatePyq: false,
    contentBody: `# Machine Learning Mathematical Compendium\n\n## 1. Linear & Logistic Regression\n- **Linear Loss Function**: $J(\\theta) = \\frac{1}{2m} \\sum_{i=1}^m (h_\\theta(x^{(i)}) - y^{(i)})^2$\n- **Gradient Descent Update**: $\\theta_j := \\theta_j - \\alpha \\frac{1}{m} \\sum_{i=1}^m (h_\\theta(x^{(i)}) - y^{(i)}) x_j^{(i)}$\n- **Logistic Sigmoid**: $\\sigma(z) = \\frac{1}{1 + e^{-z}}$. Binary Cross-Entropy Loss: $-\\frac{1}{m} \\sum [y \\log(\\hat{y}) + (1-y) \\log(1-\\hat{y})]$.\n\n## 2. Support Vector Machines\n- Maximizes geometric margin $\\frac{2}{\\|w\\|}$ subject to $y_i (w^T x_i + b) \\ge 1$.\n- Kernel Trick: Computes inner products in higher-dimensional Hilbert spaces using $K(x, x') = \\phi(x)^T \\phi(x')$.`
  },
  {
    branchCode: BranchCode.CSE,
    semesterNumber: 8,
    title: 'GATE CSE 2024: Complete Solutions & Topic-wise Analysis',
    subject: 'Operating Systems',
    topic: 'GATE PYQ Grand Compendium',
    format: ResourceFormat.GATE_PYQS,
    difficulty: Difficulty.HARD,
    description: 'Official verified solutions to GATE 2024 CSE questions covering Virtual Memory, LRU Page Faults, Deadlock, and Pipelining.',
    fileSize: '4.2 MB',
    pages: 50,
    author: 'GATE CS Faculty Board / PrepAI',
    isGatePyq: true,
    contentBody: `# GATE CSE Official Solutions\n\n**Problem:** Consider a 32-bit virtual address space with 4 KB page size. If page table entries are 4 bytes each, what is the size of the inverted page table for a physical memory of 512 MB?\n\n**Solution:**\n- Physical memory = $512\\text{ MB} = 2^{29}$ bytes.\n- Page frame size = $4\\text{ KB} = 2^{12}$ bytes.\n- Total number of physical frames = $2^{29} / 2^{12} = 2^{17} = 131,072$ frames.\n- Inverted page table has exactly one entry per physical frame.\n- Size of Inverted Page Table = $2^{17} \\times 4\\text{ bytes} = 2^{19}\\text{ bytes} = 512\\text{ KB}$.`
  },

  // ===================== ECE RESOURCES =====================
  {
    branchCode: BranchCode.ECE,
    semesterNumber: 4,
    title: 'Digital VLSI Design & Static Timing Analysis (STA)',
    subject: 'VLSI Design',
    topic: 'Setup & Hold Time Invariants',
    format: ResourceFormat.COMPENDIUM,
    difficulty: Difficulty.MEDIUM,
    description: 'Standard timing closure formulas, clock jitter, clock skew, and metastable state resolution in sequential synchronous systems.',
    fileSize: '3.1 MB',
    pages: 32,
    author: 'Prof. K. V. Rao (Microelectronics Group)',
    isGatePyq: false,
    contentBody: `# Digital VLSI & Static Timing Analysis\n\n## 1. Setup Time ($T_{setup}$)\n- Minimum duration data must remain stable BEFORE active clock edge.\n- **Setup Check**: $T_{clk} \\ge T_{cq} + T_{comb} + T_{setup} - T_{skew}$.\n\n## 2. Hold Time ($T_{hold}$)\n- Minimum duration data must remain stable AFTER active clock edge.\n- **Hold Check**: $T_{cq} + T_{comb} \\ge T_{hold} + T_{skew}$. (Hold violations cannot be solved by lowering frequency!).`
  },
  {
    branchCode: BranchCode.ECE,
    semesterNumber: 5,
    title: 'Digital Signal Processing: FFT & Filter Design Formulas',
    subject: 'Signals and Systems',
    topic: 'Z-Transform & FIR/IIR Filters',
    format: ResourceFormat.FORMULAS,
    difficulty: Difficulty.HARD,
    description: 'Comprehensive cheatsheet with Radix-2 Cooley-Tukey Butterfly diagrams, Bilinear Transformation, and Chebyshev/Butterworth pole locations.',
    fileSize: '1.7 MB',
    pages: 18,
    author: 'PrepAI ECE Signal Processing Group',
    isGatePyq: false,
    contentBody: `# DSP Mathematical Foundations\n\n## 1. Discrete Fourier Transform\n- $X[k] = \\sum_{n=0}^{N-1} x[n] W_N^{kn}$ where $W_N = e^{-j 2\\pi / N}$.\n- Cooley-Tukey Radix-2 FFT drops complexity from $O(N^2)$ to $O(N \\log_2 N)$.\n\n## 2. Bilinear Transformation\n- Maps continuous s-plane to discrete z-plane: $s = \\frac{2}{T} \\frac{1 - z^{-1}}{1 + z^{-1}}$.\n- Frequency Warping: $\\Omega = \\frac{2}{T} \\tan\\left(\\frac{\\omega}{2}\\right)$.`
  },
  {
    branchCode: BranchCode.ECE,
    semesterNumber: 6,
    title: 'Embedded Systems & Real-Time Operating Systems (RTOS)',
    subject: 'Embedded Systems',
    topic: 'Task Scheduling & Inter-Task Communication',
    format: ResourceFormat.NOTES,
    difficulty: Difficulty.MEDIUM,
    description: 'ARM Cortex-M architecture, priority inversion scenarios, Priority Ceiling Protocols, and FreeRTOS queue management.',
    fileSize: '2.2 MB',
    pages: 28,
    author: 'Embedded Systems Working Group',
    isGatePyq: false,
    contentBody: `# Embedded Systems & RTOS Core Notes\n\n## 1. Real-Time Scheduling\n- **Rate Monotonic Scheduling (RMS)**: Static priority assignment inversely proportional to task period. Schedulability bound: $U \\le n(2^{1/n} - 1)$.\n- **Earliest Deadline First (EDF)**: Dynamic priority assignment. Schedulable if total utilization $U \\le 1$.\n\n## 2. Priority Inversion\n- Condition where high-priority task is blocked waiting for shared resource held by low-priority task, while medium-priority task preempts low-priority task.\n- **Solution**: Priority Inheritance Protocol (PIP) dynamically elevates low-priority task's priority to that of the highest task waiting on the shared mutex.`
  },

  // ===================== EE RESOURCES =====================
  {
    branchCode: BranchCode.EE,
    semesterNumber: 4,
    title: 'Control Systems Engineering: Stability, Bode & Nyquist',
    subject: 'Control Systems',
    topic: 'Frequency Response & State Space Analysis',
    format: ResourceFormat.COMPENDIUM,
    difficulty: Difficulty.HARD,
    description: 'Comprehensive study notes on Routh-Hurwitz criterion, Gain and Phase margins from Bode plots, and Nyquist encirclement proofs.',
    fileSize: '2.9 MB',
    pages: 36,
    author: 'Dr. M. K. Banerjee (Control Systems Lab)',
    isGatePyq: false,
    contentBody: `# Control Systems Engineering Compendium\n\n## 1. Stability in Frequency Domain\n- **Gain Margin (GM)**: $20 \\log_{10}(1 / |G(j\\omega_{pc})|)$ where $\\angle G(j\\omega_{pc}) = -180^\\circ$.\n- **Phase Margin (PM)**: $180^\\circ + \\angle G(j\\omega_{gc})$ where $|G(j\\omega_{gc})| = 1$.\n- System is stable if $\\omega_{gc} < \\omega_{pc}$ (both GM and PM positive).\n\n## 2. State-Space Representation\n- $\\dot{x}(t) = Ax(t) + Bu(t)$\n- $y(t) = Cx(t) + Du(t)$\n- Controllability Matrix: $Q_c = [B \\quad AB \\quad A^2B \\dots A^{n-1}B]$ has rank $n$.`
  },
  {
    branchCode: BranchCode.EE,
    semesterNumber: 5,
    title: 'Power Systems Analysis: Symmetrical Faults & Sequence Networks',
    subject: 'Power Systems',
    topic: 'Fault Calculations & Transmission Lines',
    format: ResourceFormat.GATE_PYQS,
    difficulty: Difficulty.HARD,
    description: 'Step-by-step solved GATE questions on positive/negative/zero sequence networks and Single Line-to-Ground (SLG) fault calculations.',
    fileSize: '2.8 MB',
    pages: 24,
    author: 'GATE EE Faculty Board / PrepAI',
    isGatePyq: true,
    contentBody: `# GATE EE Power Systems Fault Solutions\n\n**Problem:** A 3-phase generator with subtransient reactance $X_1=0.2, X_2=0.15, X_0=0.05$ p.u. experiences a dead short Single Line-to-Ground (SLG) fault. Calculate the subtransient fault current in p.u.\n\n**Solution:**\n- In an SLG fault, sequence networks are connected in series:\n- $I_{a0} = I_{a1} = I_{a2} = \\frac{E_a}{X_1 + X_2 + X_0 + 3Z_f}$\n- With $E_a = 1.0$ p.u. and $Z_f = 0$:\n- $I_{a1} = \\frac{1.0}{0.2 + 0.15 + 0.05} = \\frac{1.0}{0.4} = 2.5$ p.u.\n- Fault Current $I_f = 3 \\times I_{a1} = 3 \\times 2.5 = 7.5$ p.u.`
  },

  // ===================== ME RESOURCES =====================
  {
    branchCode: BranchCode.ME,
    semesterNumber: 3,
    title: 'Applied Thermodynamics: Power Cycles & Entropy Balance',
    subject: 'Thermodynamics',
    topic: 'Carnot, Rankine & Brayton Cycles',
    format: ResourceFormat.COMPENDIUM,
    difficulty: Difficulty.MEDIUM,
    description: 'Detailed study notes covering the First and Second Laws of Thermodynamics, entropy generation, exergy, and steam power cycles.',
    fileSize: '3.6 MB',
    pages: 38,
    author: 'Dr. H. C. Verma (Thermal Engineering Lab)',
    isGatePyq: false,
    contentBody: `# Applied Thermodynamics Guide\n\n## 1. Laws of Thermodynamics\n- **First Law**: $dQ = dU + dW$ (energy conservation).\n- **Second Law**: Clausius and Kelvin-Planck statements; entropy generation $S_{gen} \\ge 0$ for all real spontaneous processes.\n\n## 2. Power Cycles\n- **Carnot Cycle Efficiency**: $\\eta = 1 - \\frac{T_L}{T_H}$.\n- **Rankine Cycle**: Reheat and regeneration prevent condensation in low-pressure turbine stages and increase overall thermal efficiency.`
  },
  {
    branchCode: BranchCode.ME,
    semesterNumber: 4,
    title: 'Strength of Materials & Beam Deflection Cheatsheet',
    subject: 'Strength of Materials',
    topic: 'Bending Stress & Mohr\'s Circle',
    format: ResourceFormat.CHEATSHEET,
    difficulty: Difficulty.EASY,
    description: 'Formulas and diagrams for Mohr\'s circle, Euler buckling, pure bending equation, and double integration deflection.',
    fileSize: '1.1 MB',
    pages: 7,
    author: 'PrepAI Mechanical Structural Group',
    isGatePyq: false,
    contentBody: `# Strength of Materials Cheatsheet\n\n## Pure Bending Formula\n$$\\frac{\\sigma}{y} = \\frac{M}{I} = \\frac{E}{R}$$\n- $\\sigma$: Bending stress\n- $M$: Bending moment\n- $I$: Area moment of inertia\n- $y$: Distance from neutral axis\n\n## Mohr's Circle for Plane Stress\n- Principal Stresses: $\\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}$\n- Maximum Shear Stress: $\\tau_{max} = \\frac{\\sigma_1 - \\sigma_2}{2}$`
  },
  {
    branchCode: BranchCode.ME,
    semesterNumber: 5,
    title: 'Fluid Mechanics & Boundary Layer Theory Solutions',
    subject: 'Fluid Mechanics',
    topic: 'Bernoulli Equation & Navier-Stokes',
    format: ResourceFormat.GATE_PYQS,
    difficulty: Difficulty.HARD,
    description: 'Official GATE ME questions on pipe friction factor (Moody diagram), laminar flow in pipes (Hagen-Poiseuille), and boundary layer thickness.',
    fileSize: '2.6 MB',
    pages: 20,
    author: 'GATE ME Review Board / PrepAI',
    isGatePyq: true,
    contentBody: `# GATE ME Fluid Mechanics Solutions\n\n**Problem:** Water flows through a horizontal pipe of diameter $D = 0.1$ m at average velocity $V = 2$ m/s. If friction factor $f = 0.02$, calculate head loss over length $L = 50$ m.\n\n**Solution:**\n- Darcy-Weisbach Equation: $h_f = \\frac{f \\cdot L \\cdot V^2}{2 \\cdot g \\cdot D}$\n- $h_f = \\frac{0.02 \\cdot 50 \\cdot 2^2}{2 \\cdot 9.81 \\cdot 0.1}$\n- $h_f = \\frac{4}{1.962} = 2.038\\text{ meters}$.`
  }
];
