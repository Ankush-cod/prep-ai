// prisma/seed.ts
import { BranchCode, Difficulty, PrismaClient, ResourceFormat } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[PrepAI Seed] Seeding branches, semesters, companies, problems, questions, and resources...');

  // 1. Seed 4 Engineering Branches
  const branchesData: { code: BranchCode; name: string; description: string }[] = [
    {
      code: BranchCode.CSE,
      name: 'Computer Science & Engineering',
      description: 'Data structures, algorithms, OS internals, DBMS, computer networks, and distributed systems.',
    },
    {
      code: BranchCode.ECE,
      name: 'Electronics & Communication Engineering',
      description: 'Digital VLSI, RTL design, signals & systems, communication protocols, and embedded firmware.',
    },
    {
      code: BranchCode.EE,
      name: 'Electrical Engineering',
      description: 'Power electronics, electrical machines, control systems, power grids, and instrumentation.',
    },
    {
      code: BranchCode.ME,
      name: 'Mechanical Engineering',
      description: 'Thermodynamics, fluid mechanics, strength of materials, machine design, and CAD/FEA.',
    },
  ];

  const branchMap = new Map<BranchCode, string>();
  for (const b of branchesData) {
    const branch = await prisma.branch.upsert({
      where: { code: b.code },
      update: { name: b.name, description: b.description },
      create: b,
    });
    branchMap.set(b.code, branch.id);
  }

  // 2. Seed Semesters 1..8
  const semesterMap = new Map<number, string>();
  for (let num = 1; num <= 8; num++) {
    const sem = await prisma.semester.upsert({
      where: { number: num },
      update: { label: `Semester ${num}` },
      create: { number: num, label: `Semester ${num}` },
    });
    semesterMap.set(num, sem.id);
  }

  // 3. Seed Companies
  const companiesData = [
    {
      name: 'Google',
      slug: 'google',
      industry: 'Cloud & Software Infrastructure',
      description: 'Focuses on algorithmic efficiency, scalable distributed storage, concurrency, and systems architecture.',
    },
    {
      name: 'Microsoft',
      slug: 'microsoft',
      industry: 'Enterprise Cloud & OS Engineering',
      description: 'Evaluates OS internals, lock-free data structures, cloud reliability, and object-oriented design.',
    },
    {
      name: 'Amazon',
      slug: 'amazon',
      industry: 'E-Commerce & Distributed Cloud (AWS)',
      description: 'Prioritizes distributed services, high-throughput rate limiting, leadership principles, and coding clarity.',
    },
    {
      name: 'Qualcomm',
      slug: 'qualcomm',
      industry: 'Semiconductors & Wireless Systems',
      description: 'Tests digital VLSI, clock-domain crossing, embedded C, RTOS scheduling, and DSP fundamentals.',
    },
    {
      name: 'Nvidia',
      slug: 'nvidia',
      industry: 'Accelerated Computing & Silicon',
      description: 'Assesses computer architecture, GPU memory hierarchy, C++ concurrency, and RTL timing closure.',
    },
    {
      name: 'Texas Instruments',
      slug: 'texas-instruments',
      industry: 'Analog, Power & Embedded Electronics',
      description: 'Emphasizes analog circuits, power converters, control stability, and microcontroller interfacing.',
    },
    {
      name: 'General Electric',
      slug: 'general-electric',
      industry: 'Industrial Turbines & Mechanical Systems',
      description: 'Focuses on thermodynamics, heat transfer, FEA boundary conditions, and turbomachinery mechanics.',
    },
  ];

  const companyMap = new Map<string, string>();
  for (const c of companiesData) {
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name, industry: c.industry, description: c.description },
      create: c,
    });
    companyMap.set(c.name, company.id);
  }

  // 4. Seed Company Interview Questions (idempotent by checking title+companyId)
  const companyQuestionsData = [
    {
      companyName: 'Google',
      role: 'Software Engineer (SDE-1 / L4)',
      title: 'Design a Distributed Rate Limiter with Sliding Window Counter',
      questionText:
        'Design a distributed rate limiter supporting 1M requests/sec across multiple regions with sliding window counter semantics and minimal Redis round trips.',
      topic: 'System Design',
      difficulty: Difficulty.HARD,
      tags: ['System Design', 'Redis Lua', 'Distributed Systems'],
      frequency: 'Very High',
      lastAsked: 'Oct 2025',
      provenance: 'Verified Historical',
      solutionSummary:
        'Use an atomic Redis Lua script maintaining per-window counters with weighted interpolation between current and previous buckets, local token-bucket pre-fetching for hot keys, and fail-open circuit breakers if Redis shards degrade.',
      keyConcepts: ['Sliding Window Counter', 'Redis Lua Atomicity', 'Fail-Open Degradation'],
      acceptanceRate: '42.4%',
    },
    {
      companyName: 'Amazon',
      role: 'SDE-1 (AWS Core)',
      title: 'Implement an O(1) LRU Cache with Thread-Safe Sharded Locking',
      questionText:
        'Implement an LRU cache supporting O(1) get and put operations, then explain how to partition locks to scale under multi-threaded contention.',
      topic: 'Data Structures & Concurrency',
      difficulty: Difficulty.MEDIUM,
      tags: ['HashMap', 'Doubly Linked List', 'Concurrency'],
      frequency: 'Very High',
      lastAsked: 'Nov 2025',
      provenance: 'Verified Historical',
      solutionSummary:
        'Combine a hash map for O(1) node lookup with a doubly linked list with sentinel head/tail nodes for O(1) promotion/eviction. Partition the keyspace into N independent hash-striped shards to reduce mutex contention.',
      keyConcepts: ['Sentinel Linked List', 'Hash Striping', 'Lock Contention'],
      acceptanceRate: '56.1%',
    },
    {
      companyName: 'Microsoft',
      role: 'Systems Software Engineer',
      title: 'Prevent False Sharing in a Lock-Free SPSC Ring Buffer',
      questionText:
        'How does CPU cache-line bouncing degrade producer-consumer ring buffers, and how do alignas(64) and acquire/release memory orderings resolve it?',
      topic: 'Operating Systems & Concurrency',
      difficulty: Difficulty.HARD,
      tags: ['OS Internals', 'Atomics', 'CPU Cache'],
      frequency: 'High',
      lastAsked: 'Sep 2025',
      provenance: 'Candidate Reported',
      solutionSummary:
        'Place head and tail atomic indices on separate 64-byte cache lines using alignas(64) to eliminate MESI invalidation ping-pong. Use memory_order_release when publishing indices and memory_order_acquire when consuming.',
      keyConcepts: ['MESI Protocol', 'Cache-Line Alignment', 'Acquire-Release Semantics'],
      acceptanceRate: '38.7%',
    },
    {
      companyName: 'Qualcomm',
      role: 'ASIC / Modem Firmware Engineer',
      title: 'Dual-Clock Asynchronous FIFO & Gray Code Pointer Synchronization',
      questionText:
        'Explain why binary pointers fail across asynchronous clock domains and derive the full/empty flag generation logic using Gray-coded pointers.',
      topic: 'Digital VLSI & CDC',
      difficulty: Difficulty.HARD,
      tags: ['VLSI', 'CDC', 'Metastability', 'FIFO'],
      frequency: 'Very High',
      lastAsked: 'Oct 2025',
      provenance: 'Verified Historical',
      solutionSummary:
        'Binary counters flip multiple bits simultaneously during transitions like 0111 -> 1000, causing skew across 2-FF synchronizers. Gray coding ensures only 1 bit changes per increment; full/empty comparisons inspect MSB bits after 2-stage synchronization.',
      keyConcepts: ['2-FF Synchronizer', 'Gray Coding', 'MTBF Metastability'],
      acceptanceRate: '44.0%',
    },
    {
      companyName: 'Nvidia',
      role: 'GPU Architecture Engineer',
      title: 'Memory Coalescing & Bank Conflict Elimination in Shared SRAM',
      questionText:
        'Why do strided global memory accesses hurt warp throughput, and how do padding strategies eliminate shared memory bank conflicts?',
      topic: 'Computer Architecture',
      difficulty: Difficulty.HARD,
      tags: ['GPU Architecture', 'Memory Hierarchy', 'Parallelism'],
      frequency: 'High',
      lastAsked: 'Oct 2025',
      provenance: 'Verified Historical',
      solutionSummary:
        'Adjacent threads in a warp accessing contiguous 128-byte aligned segments coalesce into a single memory transaction. Adding 1 column of padding in 32-bank shared memory matrices offsets row strides so threads hit distinct banks.',
      keyConcepts: ['Warp Coalescing', '32-Bank Shared Memory', 'Memory Bandwidth'],
      acceptanceRate: '41.2%',
    },
    {
      companyName: 'Texas Instruments',
      role: 'Analog & Power Design Engineer',
      title: 'Buck Converter Loop Compensation & Right-Half-Plane Zero Analysis',
      questionText:
        'Compare Type-II and Type-III compensators for a synchronous Buck converter and explain why Boost topologies exhibit a Right-Half-Plane zero.',
      topic: 'Power Electronics & Control',
      difficulty: Difficulty.MEDIUM,
      tags: ['Power Electronics', 'Control Loops', 'Bode Stability'],
      frequency: 'High',
      lastAsked: 'Sep 2025',
      provenance: 'Verified Historical',
      solutionSummary:
        'Type-III compensation provides two zeros to cancel the LC double pole phase lag in voltage-mode Buck converters. In Boost converters, increasing duty cycle temporarily reduces inductor delivery to output during switch-on, causing an RHP zero that limits crossover bandwidth.',
      keyConcepts: ['Phase Margin', 'Type-III Compensator', 'RHP Zero'],
      acceptanceRate: '49.5%',
    },
    {
      companyName: 'General Electric',
      role: 'Thermal & Mechanical Systems Engineer',
      title: 'Brayton Cycle Regeneration & Turbine Blade Thermal Stress Analysis',
      questionText:
        'Derive how regeneration improves gas turbine thermal efficiency at moderate pressure ratios and identify boundary conditions for coupled thermo-structural FEA.',
      topic: 'Thermodynamics & FEA',
      difficulty: Difficulty.MEDIUM,
      tags: ['Thermodynamics', 'Brayton Cycle', 'FEA'],
      frequency: 'Medium',
      lastAsked: 'Aug 2025',
      provenance: 'Verified Historical',
      solutionSummary:
        'Regeneration preheats compressor exit air using turbine exhaust when T4 > T2, lowering fuel heat input. Coupled FEA applies convective HTC film boundaries for thermal gradients and centrifugal rotational body loads for blade root stress.',
      keyConcepts: ['Brayton Cycle', 'Regenerator Effectiveness', 'Thermo-Mechanical Coupling'],
      acceptanceRate: '58.0%',
    },
  ];

  for (const q of companyQuestionsData) {
    const companyId = companyMap.get(q.companyName);
    if (!companyId) continue;
    const existing = await prisma.companyQuestion.findFirst({
      where: { companyId, title: q.title },
    });
    if (!existing) {
      await prisma.companyQuestion.create({
        data: {
          companyId,
          role: q.role,
          title: q.title,
          questionText: q.questionText,
          topic: q.topic,
          difficulty: q.difficulty,
          tags: q.tags,
          frequency: q.frequency,
          lastAsked: q.lastAsked,
          provenance: q.provenance,
          solutionSummary: q.solutionSummary,
          keyConcepts: q.keyConcepts,
          acceptanceRate: q.acceptanceRate,
        },
      });
    }
  }

  // 5. Seed Coding Problems (with real stdin/stdout testcases for OnlineCompiler.io)
  const codingProblemsData = [
    {
      slug: 'two-sum-indices',
      title: 'Two Sum Indices',
      difficulty: Difficulty.EASY,
      topic: 'Arrays & Hashing',
      track: 'Core DSA',
      step: 'Step 3: Arrays',
      tags: ['Array', 'Hash Map', 'O(N)'],
      companyName: 'Google',
      description:
        'Given an integer n, followed by n integers in an array nums, and an integer target on the next line, print the two 0-based indices (space-separated, smaller index first) such that nums[i] + nums[j] == target.',
      constraints: ['2 <= n <= 10^5', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid pair exists'],
      examples: [
        {
          input: '4\n2 7 11 15\n9',
          output: '0 1',
          explanation: 'nums[0] + nums[1] = 2 + 7 = 9.',
        },
        {
          input: '3\n3 2 4\n6',
          output: '1 2',
        },
      ],
      starterCode: {
        cpp: '#include <iostream>\n#include <unordered_map>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<long long> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    long long target;\n    cin >> target;\n    unordered_map<long long, int> seen;\n    for (int i = 0; i < n; i++) {\n        long long need = target - nums[i];\n        if (seen.count(need)) {\n            cout << seen[need] << " " << i << "\\n";\n            return 0;\n        }\n        seen[nums[i]] = i;\n    }\n    return 0;\n}\n',
        python: 'import sys\n\ndef solve():\n    data = sys.stdin.read().strip().split()\n    if not data:\n        return\n    n = int(data[0])\n    nums = list(map(int, data[1:1+n]))\n    target = int(data[1+n])\n    seen = {}\n    for i, val in enumerate(nums):\n        need = target - val\n        if need in seen:\n            print(seen[need], i)\n            return\n        seen[val] = i\n\nif __name__ == "__main__":\n    solve()\n',
        java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        long[] nums = new long[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextLong();\n        long target = sc.nextLong();\n        Map<Long, Integer> seen = new HashMap<>();\n        for (int i = 0; i < n; i++) {\n            long need = target - nums[i];\n            if (seen.containsKey(need)) {\n                System.out.println(seen.get(need) + " " + i);\n                return;\n            }\n            seen.put(nums[i], i);\n        }\n    }\n}\n',
        javascript: 'const fs = require("fs");\nconst data = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);\nif (data.length) {\n  const n = data[0];\n  const nums = data.slice(1, 1 + n);\n  const target = data[1 + n];\n  const seen = new Map();\n  for (let i = 0; i < n; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) {\n      console.log(seen.get(need) + " " + i);\n      break;\n    }\n    seen.set(nums[i], i);\n  }\n}\n',
      },
      testCases: [
        { input: '4\n2 7 11 15\n9', expectedOutput: '0 1' },
        { input: '3\n3 2 4\n6', expectedOutput: '1 2' },
        { input: '2\n3 3\n6', expectedOutput: '0 1' },
      ],
    },
    {
      slug: 'max-subarray-kadane',
      title: 'Maximum Subarray Sum',
      difficulty: Difficulty.MEDIUM,
      topic: 'Dynamic Programming & Arrays',
      track: 'Core DSA',
      step: 'Step 3: Arrays',
      tags: ['Kadane', 'Dynamic Programming', 'Divide & Conquer'],
      companyName: 'Microsoft',
      description:
        'Given an integer n and an array of n integers (possibly negative), find the contiguous subarray (containing at least one element) which has the largest sum and output its sum.',
      constraints: ['1 <= n <= 10^5', '-10^4 <= nums[i] <= 10^4'],
      examples: [
        {
          input: '9\n-2 1 -3 4 -1 2 1 -5 4',
          output: '6',
          explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.',
        },
      ],
      starterCode: {
        cpp: '#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    long long cur = 0, best = -1e18;\n    for (int i = 0; i < n; i++) {\n        long long x;\n        cin >> x;\n        cur = max(x, cur + x);\n        best = max(best, cur);\n    }\n    cout << best << "\\n";\n    return 0;\n}\n',
        python: 'import sys\ndata = list(map(int, sys.stdin.read().split()))\nif data:\n    nums = data[1:1+data[0]]\n    cur = best = nums[0]\n    for x in nums[1:]:\n        cur = max(x, cur + x)\n        best = max(best, cur)\n    print(best)\n',
        java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        long cur = sc.nextLong();\n        long best = cur;\n        for (int i = 1; i < n; i++) {\n            long x = sc.nextLong();\n            cur = Math.max(x, cur + x);\n            best = Math.max(best, cur);\n        }\n        System.out.println(best);\n    }\n}\n',
        javascript: 'const fs = require("fs");\nconst data = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);\nif (data.length) {\n  const nums = data.slice(1, 1 + data[0]);\n  let cur = nums[0], best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    best = Math.max(best, cur);\n  }\n  console.log(best);\n}\n',
      },
      testCases: [
        { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
        { input: '1\n-5', expectedOutput: '-5' },
        { input: '5\n5 4 -1 7 8', expectedOutput: '23' },
      ],
    },
    {
      slug: 'lru-cache-operations',
      title: 'LRU Cache Simulation',
      difficulty: Difficulty.HARD,
      topic: 'Design & Hashing',
      track: 'Systems & Design',
      step: 'Step 9: Stacks & Queues',
      tags: ['HashMap', 'Doubly Linked List', 'Cache'],
      companyName: 'Amazon',
      description:
        'Implement an LRU Cache of capacity C. Read C and Q (number of operations). Each operation is either "PUT key value" or "GET key". For every GET, print the value if present else -1 on its own line.',
      constraints: ['1 <= C <= 3000', '1 <= Q <= 50000'],
      examples: [
        {
          input: '2 6\nPUT 1 1\nPUT 2 2\nGET 1\nPUT 3 3\nGET 2\nGET 3',
          output: '1\n-1\n3',
        },
      ],
      starterCode: {
        cpp: '#include <iostream>\n#include <list>\n#include <unordered_map>\n#include <string>\nusing namespace std;\n\nint main() {\n    int cap, q;\n    if (!(cin >> cap >> q)) return 0;\n    list<pair<int,int>> cache;\n    unordered_map<int, list<pair<int,int>>::iterator> mp;\n    while (q--) {\n        string op; cin >> op;\n        if (op == "PUT") {\n            int k, v; cin >> k >> v;\n            if (mp.count(k)) { cache.erase(mp[k]); }\n            else if ((int)cache.size() == cap) { mp.erase(cache.back().first); cache.pop_back(); }\n            cache.push_front({k, v});\n            mp[k] = cache.begin();\n        } else {\n            int k; cin >> k;\n            if (!mp.count(k)) cout << -1 << "\\n";\n            else { cache.splice(cache.begin(), cache, mp[k]); cout << mp[k]->second << "\\n"; }\n        }\n    }\n    return 0;\n}\n',
        python: 'import sys\nfrom collections import OrderedDict\nlines = sys.stdin.read().strip().splitlines()\nif lines:\n    cap, q = map(int, lines[0].split())\n    od = OrderedDict()\n    for line in lines[1:1+q]:\n        parts = line.split()\n        if parts[0] == "PUT":\n            k, v = int(parts[1]), int(parts[2])\n            if k in od: od.move_to_end(k)\n            od[k] = v\n            if len(od) > cap: od.popitem(last=False)\n        else:\n            k = int(parts[1])\n            if k not in od: print(-1)\n            else: od.move_to_end(k); print(od[k])\n',
        java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int cap = sc.nextInt(), q = sc.nextInt();\n        LinkedHashMap<Integer, Integer> map = new LinkedHashMap<>(cap, 0.75f, true) {\n            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) { return size() > cap; }\n        };\n        while (q-- > 0) {\n            String op = sc.next();\n            if (op.equals("PUT")) { map.put(sc.nextInt(), sc.nextInt()); }\n            else { Integer v = map.get(sc.nextInt()); System.out.println(v == null ? -1 : v); }\n        }\n    }\n}\n',
        javascript: 'const fs = require("fs");\nconst lines = fs.readFileSync(0, "utf8").trim().split(/\\r?\\n/);\nif (lines.length) {\n  const [cap, q] = lines[0].trim().split(/\\s+/).map(Number);\n  const map = new Map();\n  for (let i = 1; i <= q; i++) {\n    const [op, a, b] = lines[i].trim().split(/\\s+/);\n    const k = Number(a);\n    if (op === "PUT") {\n      if (map.has(k)) map.delete(k);\n      map.set(k, Number(b));\n      if (map.size > cap) map.delete(map.keys().next().value);\n    } else {\n      if (!map.has(k)) console.log(-1);\n      else { const v = map.get(k); map.delete(k); map.set(k, v); console.log(v); }\n    }\n  }\n}\n',
      },
      testCases: [
        { input: '2 6\nPUT 1 1\nPUT 2 2\nGET 1\nPUT 3 3\nGET 2\nGET 3', expectedOutput: '1\n-1\n3' },
        { input: '1 4\nPUT 10 100\nPUT 20 200\nGET 10\nGET 20', expectedOutput: '-1\n200' },
      ],
    },
  ];

  for (const p of codingProblemsData) {
    const companyId = p.companyName ? companyMap.get(p.companyName) : undefined;
    await prisma.codingProblem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
        track: p.track,
        step: p.step,
        tags: p.tags,
        description: p.description,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
        testCases: p.testCases,
        companyId: companyId || null,
      },
      create: {
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
        track: p.track,
        step: p.step,
        tags: p.tags,
        description: p.description,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
        testCases: p.testCases,
        companyId: companyId || null,
      },
    });
  }

  // 6. Seed Preparation Resources (across CSE, ECE, EE, ME including GATE PYQs inside branch resources)
  const resourcesData = [
    {
      branch: BranchCode.CSE,
      semester: 5,
      title: 'Operating Systems Internals & Concurrency Synchronization Compendium',
      subject: 'Operating Systems',
      topic: 'Virtual Memory, Deadlocks & Pthreads',
      format: ResourceFormat.COMPENDIUM,
      description:
        'Comprehensive notes covering page tables, TLB shootdowns, Banker deadlock avoidance, condition variables, and reader-writer locks.',
      fileSize: '4.2 MB',
      pages: 48,
      author: 'PrepAI CSE Editorial',
      isGatePyq: false,
      contentBody:
        'Key Modules: 1. Process Control Blocks & Context Switch Overhead. 2. Multi-Level Page Tables & Inverted Indexing. 3. Mutex vs Semaphore vs Futex Primitives.',
    },
    {
      branch: BranchCode.CSE,
      semester: 6,
      title: 'GATE CSE Archive: DBMS Normalization, B+ Trees & Serializability PYQs',
      subject: 'Database Management Systems',
      topic: 'Conflict Serializability & Indexing',
      format: ResourceFormat.GATE_PYQS,
      description:
        'Curated GATE CSE previous-year questions on B+ Tree order calculations, 3NF/BCNF decomposition, and two-phase locking protocols.',
      fileSize: '3.1 MB',
      pages: 34,
      author: 'PrepAI GATE Archive',
      isGatePyq: true,
      contentBody:
        'Includes worked solutions for precedence graphs, strict 2PL schedules, and block fanout formulas.',
    },
    {
      branch: BranchCode.ECE,
      semester: 5,
      title: 'Digital VLSI Timing Closure & Clock Domain Crossing Guide',
      subject: 'Digital VLSI Design',
      topic: 'Setup/Hold Slack & CDC Synchronizers',
      format: ResourceFormat.NOTES,
      description:
        'Detailed derivation of static timing paths, clock skew impact on setup/hold margins, and Gray-coded asynchronous FIFO pointers.',
      fileSize: '3.8 MB',
      pages: 38,
      author: 'PrepAI ECE Editorial',
      isGatePyq: false,
      contentBody:
        'Setup equation: T_clk + T_skew >= T_cq + T_comb + T_su. Hold equation: T_cq + T_comb >= T_hold + T_skew.',
    },
    {
      branch: BranchCode.ECE,
      semester: 6,
      title: 'GATE ECE Signals, Systems & Communication PYQ Compendium',
      subject: 'Signals & Systems',
      topic: 'Laplace, Z-Transform & Sampling Theorem',
      format: ResourceFormat.GATE_PYQS,
      description:
        'Solved GATE ECE previous-year problems on ROC properties, LTI stability criteria, and Nyquist bandpass sampling.',
      fileSize: '2.9 MB',
      pages: 30,
      author: 'PrepAI GATE Archive',
      isGatePyq: true,
      contentBody:
        'Covers causal vs anti-causal ROC intersections and matched filter SNR maximization.',
    },
    {
      branch: BranchCode.EE,
      semester: 5,
      title: 'Power Electronics Inverter Topologies & SVPWM Cheatsheet',
      subject: 'Power Electronics',
      topic: 'DC-DC Converters & Three-Phase VSI',
      format: ResourceFormat.CHEATSHEET,
      description:
        'Quick-reference waveform tables, duty-cycle equations, and harmonic distortion formulas for Buck, Boost, and SVPWM inverters.',
      fileSize: '2.2 MB',
      pages: 18,
      author: 'PrepAI EE Editorial',
      isGatePyq: false,
      contentBody:
        'Covers continuous vs discontinuous conduction boundary inductance and space-vector modulation sector dwell times.',
    },
    {
      branch: BranchCode.EE,
      semester: 6,
      title: 'GATE EE Control Systems: Root Locus, Bode & State-Space PYQs',
      subject: 'Control Systems',
      topic: 'Nyquist Stability & Controllability',
      format: ResourceFormat.GATE_PYQS,
      description:
        'Branch-integrated GATE EE previous-year questions on Routh-Hurwitz arrays, phase margin compensation, and Kalman observability.',
      fileSize: '3.4 MB',
      pages: 36,
      author: 'PrepAI GATE Archive',
      isGatePyq: true,
      contentBody:
        'Includes step-by-step state-transition matrix derivations and steady-state error constants.',
    },
    {
      branch: BranchCode.ME,
      semester: 5,
      title: 'Applied Thermodynamics & Gas Power Cycles Reference Notes',
      subject: 'Thermodynamics',
      topic: 'Rankine, Brayton & Entropy Generation',
      format: ResourceFormat.NOTES,
      description:
        'Formulas and derivations for reheat/regenerative Rankine cycles, Brayton cycle work ratio, and exergy destruction.',
      fileSize: '2.7 MB',
      pages: 26,
      author: 'PrepAI ME Editorial',
      isGatePyq: false,
      contentBody:
        'Covers T-s and h-s Mollier diagrams, compressor isentropic efficiency, and nozzle choking conditions.',
    },
    {
      branch: BranchCode.ME,
      semester: 6,
      title: 'GATE ME Strength of Materials & Machine Design PYQ Bank',
      subject: 'Strength of Materials',
      topic: 'Mohr Circle, Deflection & Fatigue Theories',
      format: ResourceFormat.GATE_PYQS,
      description:
        'Solved GATE ME previous-year problems covering principal stresses, Soderberg/Goodman fatigue limits, and Castigliano theorem.',
      fileSize: '3.5 MB',
      pages: 42,
      author: 'PrepAI GATE Archive',
      isGatePyq: true,
      contentBody:
        'Covers von Mises distortion energy criterion and Euler buckling critical load end-fixity factors.',
    },
  ];

  for (const r of resourcesData) {
    const branchId = branchMap.get(r.branch);
    const semesterId = semesterMap.get(r.semester);
    if (!branchId || !semesterId) continue;

    const existing = await prisma.preparationResource.findFirst({
      where: { branchId, title: r.title },
    });
    if (!existing) {
      await prisma.preparationResource.create({
        data: {
          branchId,
          semesterId,
          title: r.title,
          subject: r.subject,
          topic: r.topic,
          format: r.format,
          description: r.description,
          fileSize: r.fileSize,
          pages: r.pages,
          author: r.author,
          isGatePyq: r.isGatePyq,
          isVerified: true,
          contentBody: r.contentBody,
        },
      });
    }
  }

  console.log('[PrepAI Seed] Completed successfully.');
}

main()
  .catch((err) => {
    console.error('[PrepAI Seed] Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
