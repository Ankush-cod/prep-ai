// prisma/seedData/companiesAndQuestions.ts
import { Difficulty } from '@prisma/client';

export interface CompanySeed {
  name: string;
  slug: string;
  industry: string;
  description: string;
}

export interface QuestionSeed {
  companySlug: string;
  role: string;
  title: string;
  questionText: string;
  topic: string;
  difficulty: Difficulty;
  tags: string[];
  frequency: string;
  provenance: string;
  solutionSummary: string;
  keyConcepts: string[];
  acceptanceRate: string;
}

export const targetCompanies: CompanySeed[] = [
  {
    name: 'Google',
    slug: 'google',
    industry: 'Cloud & Distributed Systems',
    description: 'Pioneers in hyperscale cloud, search, distributed consensus, and algorithmic optimization.'
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    industry: 'Enterprise Software & Azure Cloud',
    description: 'Focuses on OS architecture, lock-free concurrency, cloud reliability, and C#/C++ systems.'
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    industry: 'E-Commerce & AWS Cloud Infrastructure',
    description: 'Emphasizes customer obsession, microservice trade-offs, high-throughput caching, and leadership principles.'
  },
  {
    name: 'Adobe',
    slug: 'adobe',
    industry: 'Digital Media & Creative Cloud',
    description: 'Evaluates advanced computer graphics algorithms, memory safety, C++ template metaprogramming, and concurrency.'
  },
  {
    name: 'Flipkart',
    slug: 'flipkart',
    industry: 'E-Commerce & Supply Chain Logistics',
    description: 'Focuses on distributed inventory consistency, flash-sale traffic handling, DBMS indexing, and Low-Level Design.'
  },
  {
    name: 'Accenture',
    slug: 'accenture',
    industry: 'Technology Consulting & Digital Transformation',
    description: 'Assesses cloud migration paradigms, microservices architectures, Agile methodology, and behavioral leadership.'
  },
  {
    name: 'TCS',
    slug: 'tcs',
    industry: 'Global IT Services & Digital Engineering',
    description: 'Emphasizes core Java/OOP fundamentals, SQL query optimization, SDLC practices, and systems integration.'
  },
  {
    name: 'Infosys',
    slug: 'infosys',
    industry: 'Digital Transformation & Enterprise IT',
    description: 'Tests relational database design, REST API design, OOP abstractions, clean code practices, and behavioral fit.'
  },
  {
    name: 'Wipro',
    slug: 'wipro',
    industry: 'Enterprise IT Solutions & Cloud Consulting',
    description: 'Focuses on Java Spring frameworks, API security, database normalization, testing methodologies, and client delivery.'
  },
  {
    name: 'Deloitte',
    slug: 'deloitte',
    industry: 'Technology Advisory & Enterprise Architecture',
    description: 'Evaluates enterprise cloud readiness, IT compliance, security architecture, system design trade-offs, and communication.'
  },
  {
    name: 'HSBC',
    slug: 'hsbc',
    industry: 'Banking & Financial Technology (FinTech)',
    description: 'Prioritizes ACID transaction isolation, microservices idempotency, fraud detection latency, and security auditing.'
  }
];

function generateCompanyQuestions(): QuestionSeed[] {
  const list: QuestionSeed[] = [];

  const add = (
    companySlug: string,
    role: string,
    title: string,
    topic: string,
    difficulty: Difficulty,
    questionText: string,
    solutionSummary: string,
    keyConcepts: string[],
    provenance: 'Verified Historical' | 'Company-Targeted Practice',
    tags: string[],
    frequency = 'High',
    acceptanceRate = '45%'
  ) => {
    list.push({
      companySlug,
      role,
      title,
      topic,
      difficulty,
      questionText,
      solutionSummary,
      keyConcepts,
      provenance,
      tags,
      frequency,
      acceptanceRate
    });
  };

  // 1. Google (10 Questions)
  add('google', 'Software Engineer (L3/L4)', 'Design a Distributed Rate Limiter for Google APIs', 'System Design', Difficulty.HARD,
    'Design a distributed rate limiter that throttles API calls per user (e.g., 100 requests per second) across globally distributed servers.',
    'Use Token Bucket or Leaky Bucket with Redis cluster or distributed memory caches. Handle race conditions using Redis Lua scripts or sliding window logs with timestamps.',
    ['Token Bucket', 'Redis Lua Scripts', 'Sliding Window Counter', 'Distributed Caching', 'Eventual Consistency'],
    'Verified Historical', ['System Design', 'Distributed Systems', 'Google']);

  add('google', 'Software Engineer', 'Median of Two Sorted Arrays in O(log(min(M, N)))', 'Data Structures & Algorithms', Difficulty.HARD,
    'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays in O(log(min(m, n))) runtime.',
    'Apply binary search on the partition of the smaller array. Ensure left partition contains half the elements and max(left1, left2) <= min(right1, right2).',
    ['Binary Search', 'Partitioning', 'Logarithmic Time'],
    'Verified Historical', ['DSA', 'Binary Search', 'Google']);

  add('google', 'Systems Software Engineer', 'Linux Virtual Memory & Demand Paging Internals', 'Operating Systems', Difficulty.MEDIUM,
    'Explain step-by-step what happens inside the Linux kernel when a user process touches an unmapped or paged-out virtual address (major vs minor page fault).',
    'CPU traps to Page Fault handler (interrupt 14). Kernel checks if address is inside a valid VMA in mm_struct. If allocated but not mapped, allocates physical frame (minor). If swapped out or mmap file, triggers disk read (major). Updates page table entry and restores execution.',
    ['Page Fault Handler', 'VMA', 'TLB', 'Demand Paging', 'Dirty Pages'],
    'Verified Historical', ['OS', 'Virtual Memory', 'Google']);

  add('google', 'Software Engineer', 'Database Concurrency: MVCC vs Two-Phase Locking', 'DBMS', Difficulty.MEDIUM,
    'Compare Multi-Version Concurrency Control (MVCC) with 2PL in high-concurrency read-heavy storage engines like Google Spanner/PostgreSQL.',
    'MVCC creates immutable snapshots of row versions so readers never block writers and writers never block readers. 2PL acquires shared/exclusive locks ensuring strict serializability but causing lock contention and deadlocks.',
    ['MVCC', 'Snapshot Isolation', '2PL', 'Lock Contention', 'Write Skew'],
    'Verified Historical', ['DBMS', 'Transactions', 'Google']);

  add('google', 'Software Engineer', 'TCP BBR vs CUBIC Congestion Control', 'Computer Networks', Difficulty.MEDIUM,
    'Explain the fundamental difference between loss-based TCP congestion control (CUBIC/Reno) and bottleneck bandwidth-based control (BBR).',
    'CUBIC treats packet loss as congestion, which causes bufferbloat on high-speed long-delay links. BBR actively measures Bottleneck Bandwidth and Round-Trip Propagation Time (RTprop) to keep in-flight data equal to the BDP without filling queues.',
    ['BBR', 'CUBIC', 'Bandwidth-Delay Product (BDP)', 'Bufferbloat', 'Packet Loss'],
    'Verified Historical', ['Networks', 'TCP', 'Google']);

  add('google', 'Software Engineer', 'SOLID Principles in C++ Large-Scale Repositories', 'OOP', Difficulty.EASY,
    'How does Dependency Inversion (DIP) and Interface Segregation (ISP) prevent massive rebuild cascades in huge C++ codebases like Google Google3?',
    'DIP and ISP enforce programming to abstract pure virtual interfaces or concepts, separating interface headers from implementation files. Clients only depend on headers they actually use, preventing transitive recompile cascades.',
    ['Dependency Inversion', 'Interface Segregation', 'PIMPL Idiom', 'Compilation Units'],
    'Company-Targeted Practice', ['OOP', 'C++', 'Google']);

  add('google', 'Site Reliability Engineer', 'Cap Theorem & PACELC in Distributed Architecture', 'Software Engineering', Difficulty.MEDIUM,
    'Explain the PACELC theorem and how Google Spanner chooses between latency and consistency when partitions are not present.',
    'PACELC states that If there is a Partition (P), how does system trade Availability (A) and Consistency (C); Else (E), how does it trade Latency (L) and Consistency (C). Spanner chooses Consistency in partition, and Consistency over Latency in normal operation via TrueTime.',
    ['PACELC', 'CAP Theorem', 'TrueTime', 'Linearizability'],
    'Company-Targeted Practice', ['System Design', 'SRE', 'Google']);

  add('google', 'Software Engineer', 'Rust Memory Safety vs Go Garbage Collection', 'Programming Languages', Difficulty.MEDIUM,
    'Compare Rust ownership/borrow checker model against Go concurrent mark-sweep garbage collector in production server systems.',
    'Rust provides compile-time zero-cost memory safety without GC pauses or runtime overhead through ownership and lifetimes. Go utilizes a low-latency concurrent tri-color mark-and-sweep GC with slight CPU and memory overhead, offering simpler developer ergonomics.',
    ['Ownership & Borrowing', 'Lifetimes', 'Garbage Collection', 'Tri-Color Marking'],
    'Company-Targeted Practice', ['Languages', 'Go', 'Rust', 'Google']);

  add('google', 'Software Engineer', 'Tell Me About a Time You Solved an Ambiguous Problem', 'HR & Behavioral', Difficulty.EASY,
    'Describe a scenario where requirements were unclear and team members disagreed on the direction. How did you break down the problem and reach alignment?',
    'Use STAR framework (Situation, Task, Action, Result). Focus on creating lightweight prototypes, validating hypotheses with data, driving engineering consensus, and delivering measurable milestones.',
    ['STAR Method', 'Ambiguity', 'Consensus Building', 'Data-driven Decision'],
    'Verified Historical', ['Behavioral', 'Google']);

  add('google', 'Software Engineer', 'Handling Technical Debt vs Shipping Fast', 'HR & Behavioral', Difficulty.EASY,
    'How do you balance delivery pressure against engineering excellence and avoiding technical debt?',
    'Articulate deliberate vs accidental debt. Emphasize modular architecture, automated test coverage, writing post-launch debt-refactoring tickets, and communicating risk tradeoffs clearly with product managers.',
    ['Technical Debt', 'Pragmatism', 'Quality Standards', 'Trade-offs'],
    'Company-Targeted Practice', ['Behavioral', 'Google']);

  // 2. Microsoft (10 Questions)
  add('microsoft', 'Software Engineer', 'Reverse Nodes in k-Group', 'Data Structures & Algorithms', Difficulty.HARD,
    'Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.',
    'Count k nodes ahead. If at least k nodes exist, reverse the sublist iteratively or recursively and attach the next reversed segment to the tail of the current segment.',
    ['Linked List', 'Pointers', 'Recursion'],
    'Verified Historical', ['DSA', 'Linked Lists', 'Microsoft']);

  add('microsoft', 'Software Engineer', 'Thread Synchronization: Mutex vs Semaphore vs Spinlock in Windows/Linux', 'Operating Systems', Difficulty.MEDIUM,
    'Detail when you would use a Mutex, a Counting Semaphore, or a Spinlock in multi-threaded systems programming.',
    'Mutex is for exclusive mutual exclusion with ownership (can be recursive). Semaphore controls access to a finite pool of resources (no ownership). Spinlock is for low-latency kernel or SMP critical sections where sleep overhead is unacceptable and wait times are microscopic.',
    ['Mutex', 'Semaphore', 'Spinlock', 'Context Switch', 'Busy Waiting'],
    'Verified Historical', ['OS', 'Concurrency', 'Microsoft']);

  add('microsoft', 'Database Engineer', 'Clustered vs Non-Clustered Indexes in SQL Server', 'DBMS', Difficulty.EASY,
    'Explain the physical difference between a Clustered Index and a Non-Clustered B-tree Index in Microsoft SQL Server.',
    'A Clustered Index dictates the physical ordering of data pages on disk; a table can only have one. A Non-Clustered index contains index keys pointing to either the row locator (clustering key) or RID in a heap.',
    ['B-Tree', 'Clustered Index', 'Leaf Pages', 'Index Seek vs Scan'],
    'Verified Historical', ['DBMS', 'SQL Server', 'Microsoft']);

  add('microsoft', 'Software Engineer', 'Design a Collaborative Document Editor (Word/Docs)', 'System Design', Difficulty.HARD,
    'Design the backend data sync architecture for real-time collaborative text editing with thousands of concurrent typing users.',
    'Compare Operational Transformation (OT) and Conflict-free Replicated Data Types (CRDTs). Use WebSockets to route operations through pub/sub brokers and maintain document state via state-based or operation-based CRDT trees.',
    ['CRDT', 'Operational Transformation', 'WebSockets', 'Event Sourcing'],
    'Verified Historical', ['System Design', 'Realtime', 'Microsoft']);

  add('microsoft', 'Software Engineer', 'OSI Layer Traversal of an HTTPS GET Request', 'Computer Networks', Difficulty.MEDIUM,
    'Walk through the exact networking steps when a browser issues an HTTPS request to https://microsoft.com: DNS, TCP 3-way handshake, TLS 1.3 handshake, HTTP/2 multiplexing.',
    'DNS recursive resolution (UDP 53) -> TCP SYN/SYN-ACK/ACK (Layer 4) -> TLS 1.3 ClientHello, ServerHello, Key Share (Layer 5/6) -> HTTP/2 binary frame exchange (Layer 7) wrapped in IP packets (Layer 3) and Ethernet frames (Layer 2).',
    ['DNS', 'TCP 3-Way Handshake', 'TLS 1.3', 'HTTP/2 Multiplexing'],
    'Verified Historical', ['Networks', 'HTTPS', 'Microsoft']);

  add('microsoft', 'Software Engineer', 'Design Patterns: Factory vs Abstract Factory vs Builder', 'OOP', Difficulty.MEDIUM,
    'Illustrate when to employ the Builder pattern versus Factory Method and Abstract Factory in object creation.',
    'Factory Method creates a single product variant via subclassing. Abstract Factory creates families of related objects without specifying concrete classes. Builder constructs complex composite objects step-by-step with fluent method chaining.',
    ['Design Patterns', 'Builder Pattern', 'Abstract Factory', 'Extensibility'],
    'Company-Targeted Practice', ['OOP', 'Design Patterns', 'Microsoft']);

  add('microsoft', 'Cloud Solution Architect', 'Azure Availability Zones vs Region Pairs', 'Software Engineering', Difficulty.MEDIUM,
    'Explain high-availability fault domain separation in cloud infrastructure: Availability Zones, Fault Domains, and Georedundancy.',
    'Availability Zones provide isolated power, cooling, and networking within one region (<2ms latency). Region Pairs provide cross-regional disaster recovery >300 miles apart for catastrophic outages.',
    ['Availability Zones', 'Fault Domains', 'Disaster Recovery', 'RPO & RTO'],
    'Company-Targeted Practice', ['Cloud', 'Azure', 'Microsoft']);

  add('microsoft', 'Software Engineer', 'Async/Await & ThreadPool Starvation in C#/.NET', 'Programming Languages', Difficulty.MEDIUM,
    'What causes ThreadPool starvation in C# when mixing synchronous .Result/.Wait() with async tasks?',
    'When a synchronous wait blocks a ThreadPool thread waiting for an async continuation, that continuation also requires a thread from the same pool. Under load, all pool threads become blocked waiting for each other, causing deadlock and latency spikes.',
    ['Async/Await', 'SynchronizationContext', 'ThreadPool Starvation', 'Task Parallel Library'],
    'Verified Historical', ['C#', 'Async', 'Microsoft']);

  add('microsoft', 'Software Engineer', 'Dealing with a Critical Production Bug', 'HR & Behavioral', Difficulty.EASY,
    'Describe how you handled a high-severity production outage or regression under time pressure.',
    'Highlight immediate containment (rollback or feature flag kill-switch) before debugging, transparent stakeholder communication, blameless post-mortem, and adding regression tests.',
    ['Production Incident', 'Rollback', 'Root Cause Analysis', 'Blameless Postmortem'],
    'Verified Historical', ['Behavioral', 'Microsoft']);

  add('microsoft', 'Software Engineer', 'Growth Mindset & Learning from Failure', 'HR & Behavioral', Difficulty.EASY,
    'Give an example of a project where your initial design or assumption failed. What did you learn and how did you pivot?',
    'Demonstrate self-awareness, active listening to team feedback, rigorous benchmarking, and turning failure into a reusable architectural improvement.',
    ['Growth Mindset', 'Resilience', 'Continuous Learning'],
    'Company-Targeted Practice', ['Behavioral', 'Microsoft']);

  // 3. Amazon (10 Questions)
  add('amazon', 'Software Development Engineer (SDE-1/2)', 'Design Amazon Cart and Checkout Idempotency', 'System Design', Difficulty.HARD,
    'How do you guarantee that a user submitting a payment or checkout request twice in a flaky mobile network is only charged once?',
    'Assign a client-generated UUID Idempotency Key in the request header. Cache key in Redis/DynamoDB with atomic conditional write (PutItem with attribute_not_exists). If key exists, return stored transaction result.',
    ['Idempotency Key', 'Distributed Lock', 'DynamoDB Conditional Writes', 'ACID Transactions'],
    'Verified Historical', ['System Design', 'Amazon']);

  add('amazon', 'Software Development Engineer', 'LRU Cache Implementation with O(1) Operations', 'Data Structures & Algorithms', Difficulty.MEDIUM,
    'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with get(key) and put(key, value) in O(1) time.',
    'Use a Hash Map paired with a Doubly Linked List. Map stores key to Node pointers for O(1) lookup. The doubly linked list allows O(1) removal and insertion at the head for recency tracking.',
    ['Hash Map', 'Doubly Linked List', 'O(1) Time', 'Eviction Policy'],
    'Verified Historical', ['DSA', 'Linked Lists', 'Amazon']);

  add('amazon', 'Software Development Engineer', 'Deadlock Conditions and Prevention in Distributed DBs', 'Operating Systems', Difficulty.MEDIUM,
    'List the 4 Coffman conditions for deadlocks and explain how Wound-Wait or Wait-Die protocols resolve them.',
    'Mutual exclusion, Hold and wait, No preemption, Circular wait. Wait-Die and Wound-Wait use transaction timestamps: older transactions either wait or kill younger ones, enforcing acyclic dependency graphs.',
    ['Coffman Conditions', 'Wound-Wait', 'Wait-Die', 'Two-Phase Locking'],
    'Verified Historical', ['OS', 'Concurrency', 'Amazon']);

  add('amazon', 'Database Engineer', 'DynamoDB Partition Keys, GSI, and Hot Partition Mitigation', 'DBMS', Difficulty.MEDIUM,
    'How do you avoid hot partition throttling in Amazon DynamoDB when write throughput is heavily skewed to specific keys?',
    'Use write sharding (appending random or deterministic salt suffixes to the partition key) and scatter-gather queries, or configure DynamoDB Accelerator (DAX) and Global Secondary Indexes with high-cardinality partition keys.',
    ['DynamoDB', 'Partition Key', 'Hot Partitions', 'Write Sharding', 'GSI'],
    'Verified Historical', ['DBMS', 'NoSQL', 'Amazon']);

  add('amazon', 'Software Development Engineer', 'HTTP Status Codes and REST API Idempotency', 'Computer Networks', Difficulty.EASY,
    'Explain the idempotency characteristics of HTTP GET, POST, PUT, DELETE, and PATCH methods according to RFC standards.',
    'GET, PUT, and DELETE are idempotent (calling N times produces same side effects). POST is non-idempotent. PATCH is generally non-idempotent unless designed with idempotent operators.',
    ['REST', 'HTTP Methods', 'Idempotency', 'RFC 7231'],
    'Company-Targeted Practice', ['Networks', 'REST', 'Amazon']);

  add('amazon', 'Software Development Engineer', 'Observer vs Pub-Sub in Event-Driven Architecture', 'OOP', Difficulty.MEDIUM,
    'Differentiate between the Gang-of-Four Observer pattern and a distributed Publisher-Subscriber (Pub/Sub) broker (e.g. Amazon SNS/SQS).',
    'Observer pattern is synchronous and in-process where subject directly holds references to observers. Pub/Sub is decoupled and asynchronous via an intermediate event channel or broker, enabling independent scaling and failure isolation.',
    ['Observer Pattern', 'Pub/Sub', 'Loose Coupling', 'Amazon SNS/SQS'],
    'Company-Targeted Practice', ['OOP', 'Architecture', 'Amazon']);

  add('amazon', 'Software Development Engineer', 'Microservices Circuit Breaker & Retry with Jitter', 'Software Engineering', Difficulty.MEDIUM,
    'Why is exponential backoff with full jitter required when retrying failed downstream service calls in distributed architectures?',
    'Plain exponential backoff causes retries to cluster in synchronized thundering herds, continually swamping recovering downstream servers. Adding random jitter decorrelates retry requests across time.',
    ['Circuit Breaker', 'Exponential Backoff', 'Full Jitter', 'Thundering Herd'],
    'Verified Historical', ['Architecture', 'Reliability', 'Amazon']);

  add('amazon', 'Software Development Engineer', 'Java JVM Memory Model: Heap, Metaspace, and Garbage Collection', 'Programming Languages', Difficulty.MEDIUM,
    'Explain the difference between Java Young Generation (Eden/Survivor), Tenured/Old Gen, and Metaspace, and how G1GC avoids stop-the-world pauses.',
    'Eden and Survivor store short-lived objects (minor GC). Long-lived objects migrate to Old Gen (major GC). Metaspace holds class definitions in native memory. G1GC partitions heap into regions and prioritizes garbage collection in regions with most reclaimable space.',
    ['JVM', 'Garbage Collection', 'G1GC', 'Metaspace'],
    'Company-Targeted Practice', ['Java', 'JVM', 'Amazon']);

  add('amazon', 'Software Development Engineer', 'Leadership Principle: Customer Obsession', 'HR & Behavioral', Difficulty.EASY,
    'Give an example where you prioritized customer experience over a simpler technical shortcut or deadline.',
    'Focus on discovering unstated customer needs, advocating for latency/reliability improvements, and delivering tangible positive customer feedback.',
    ['Customer Obsession', 'Leadership Principles', 'Tradeoffs'],
    'Verified Historical', ['Behavioral', 'Amazon']);

  add('amazon', 'Software Development Engineer', 'Leadership Principle: Have Backbone; Disagree and Commit', 'HR & Behavioral', Difficulty.EASY,
    'Describe a disagreement with a team member or manager over an architectural decision. How did you handle it and what was the outcome?',
    'Highlight respectful articulation of technical pros and cons backed by data, actively listening, and once a consensus decision was finalized, committing 100% to its execution.',
    ['Disagree and Commit', 'Leadership Principles', 'Team Alignment'],
    'Verified Historical', ['Behavioral', 'Amazon']);

  // 4. Adobe (10 Questions)
  add('adobe', 'Software Engineer', 'Serialize and Deserialize a Binary Tree', 'Data Structures & Algorithms', Difficulty.HARD,
    'Design an algorithm to serialize a binary tree into a string and deserialize that string back to the original binary tree structure.',
    'Use pre-order traversal with delimiter and null placeholders (e.g., "#"). During deserialization, consume tokens recursively to reconstruct root, left, and right subtrees.',
    ['Binary Tree', 'DFS', 'Serialization'],
    'Verified Historical', ['DSA', 'Trees', 'Adobe']);

  add('adobe', 'Software Engineer', 'C++ Smart Pointers & Cyclic References', 'Programming Languages', Difficulty.MEDIUM,
    'Explain the internal mechanics of std::unique_ptr, std::shared_ptr, and std::weak_ptr, and how weak_ptr breaks circular memory leaks.',
    'unique_ptr has exclusive ownership with zero overhead. shared_ptr uses an atomic control block with strong and weak reference counts. weak_ptr observes without incrementing strong count, preventing cyclic graphs from leaking memory.',
    ['Smart Pointers', 'RAII', 'Control Block', 'Memory Leaks'],
    'Verified Historical', ['C++', 'Memory', 'Adobe']);

  add('adobe', 'Software Engineer', 'Bezier Curve Rendering & Mathematical Foundations', 'Computer Graphics', Difficulty.MEDIUM,
    'Explain De Casteljau\'s algorithm for evaluating points along cubic Bezier curves in vector graphics engines.',
    'De Casteljau\'s algorithm recursively applies linear interpolation between consecutive control points with parameter t in [0, 1] until a single point on the curve is computed.',
    ['Bezier Curves', 'De Casteljau', 'Linear Interpolation', 'Vector Graphics'],
    'Company-Targeted Practice', ['Graphics', 'Math', 'Adobe']);

  add('adobe', 'Software Engineer', 'Process vs Thread Memory Layout', 'Operating Systems', Difficulty.EASY,
    'Contrast the memory layout of processes versus threads (stack, heap, code, data, registers, file descriptors).',
    'Processes have isolated virtual memory spaces. Threads within a process share heap, global data, and file descriptors, but maintain separate stacks and register sets.',
    ['Process', 'Thread', 'Stack vs Heap', 'Context Switching'],
    'Verified Historical', ['OS', 'Concurrency', 'Adobe']);

  add('adobe', 'Software Engineer', 'B-Tree vs B+ Tree in Storage Engines', 'DBMS', Difficulty.MEDIUM,
    'Why do relational database engines almost universally prefer B+ Trees over standard B-Trees for disk-backed indexing?',
    'B+ Trees store all data pointers exclusively in leaf nodes linked as a doubly linked list, enabling fast range scans and higher branching factor in internal nodes.',
    ['B+ Tree', 'Range Queries', 'Disk I/O', 'Branching Factor'],
    'Verified Historical', ['DBMS', 'Indexing', 'Adobe']);

  add('adobe', 'Software Engineer', 'TCP Window Scaling and Flow Control', 'Computer Networks', Difficulty.MEDIUM,
    'Explain how the TCP Sliding Window mechanism prevents a fast sender from overflowing a slow receiver.',
    'Receiver advertises its available receive window buffer (rwnd) in TCP headers. Sender restricts unacknowledged bytes to min(cwnd, rwnd). Window scaling option allows windows beyond 64KB.',
    ['Sliding Window', 'Flow Control', 'rwnd', 'TCP Scaling'],
    'Company-Targeted Practice', ['Networks', 'TCP', 'Adobe']);

  add('adobe', 'Software Engineer', 'Design an Undo/Redo Framework for Image Editing', 'OOP', Difficulty.MEDIUM,
    'Design an Undo/Redo framework for complex canvas edits using the Command and Memento design patterns.',
    'Encapsulate editing actions as Command objects implementing execute() and unexecute(). Use Memento to snapshot lightweight canvas states for irreversible modifications.',
    ['Command Pattern', 'Memento Pattern', 'State Management'],
    'Verified Historical', ['OOP', 'Design Patterns', 'Adobe']);

  add('adobe', 'Software Engineer', 'Git Internal Architecture: Commits, Trees, and Blobs', 'Software Engineering', Difficulty.MEDIUM,
    'Explain how Git stores files and revisions using a content-addressable directed acyclic graph (DAG) of SHA-1/SHA-256 objects.',
    'Git stores file content as Blobs, directory structures as Trees referencing blobs/trees, and snapshots as Commits containing metadata and tree hashes.',
    ['Git Internals', 'Content-Addressable Storage', 'DAG', 'Blobs & Trees'],
    'Company-Targeted Practice', ['DevOps', 'Git', 'Adobe']);

  add('adobe', 'Software Engineer', 'Handling Tight Deadlines with Creative Solutions', 'HR & Behavioral', Difficulty.EASY,
    'Tell me about a time when you had to deliver a feature with an aggressive timeline. How did you prioritize scope?',
    'Discuss MoSCoW prioritization (Must-have vs Nice-to-have), incremental deliverable milestones, and transparent stakeholder communication.',
    ['Prioritization', 'Time Management', 'Scoping'],
    'Verified Historical', ['Behavioral', 'Adobe']);

  add('adobe', 'Software Engineer', 'Working Effectively Across Distributed Teams', 'HR & Behavioral', Difficulty.EASY,
    'How do you collaborate asynchronously with team members across multiple international time zones?',
    'Highlight thorough written documentation, clear acceptance criteria, modular task ownership, and empathetic asynchronous communication.',
    ['Collaboration', 'Asynchronous Work', 'Remote Teams'],
    'Company-Targeted Practice', ['Behavioral', 'Adobe']);

  // 5. Flipkart (10 Questions)
  add('flipkart', 'Software Development Engineer', 'Design Flash Sale Inventory Concurrency', 'System Design', Difficulty.HARD,
    'Design an inventory reservation system capable of handling 500,000 requests per minute during a Big Billion Days flash sale without overselling.',
    'Pre-warm inventory counts in Redis cluster with atomic DECR operations. Push successful reservations to Kafka queue for asynchronous order creation. Fall back to database rollback on payment expiration.',
    ['Flash Sale', 'Redis Atomic DECR', 'Kafka Queue', 'Overselling Prevention'],
    'Verified Historical', ['System Design', 'Flipkart']);

  add('flipkart', 'Software Development Engineer', 'Trapping Rain Water', 'Data Structures & Algorithms', Difficulty.HARD,
    'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    'Use two pointers (left and right) with leftMax and rightMax variables in O(N) time and O(1) space, adding max(0, min(leftMax, rightMax) - height[i]) water at each index.',
    ['Two Pointers', 'Array', 'O(1) Space'],
    'Verified Historical', ['DSA', 'Arrays', 'Flipkart']);

  add('flipkart', 'Software Development Engineer', 'Database Sharding Strategies: Hash vs Range vs Directory', 'DBMS', Difficulty.MEDIUM,
    'Compare horizontal sharding techniques for an e-commerce orders table handling 100M rows per day.',
    'Hash-based sharding provides uniform distribution but makes range queries costly. Range-based sharding excels at time-series range lookups but suffers from hot spot writes. Directory-based sharding provides flexibility via lookup tables at the cost of extra latency.',
    ['Sharding', 'Consistent Hashing', 'Data Distribution', 'Hotspots'],
    'Verified Historical', ['DBMS', 'Scalability', 'Flipkart']);

  add('flipkart', 'Software Development Engineer', 'Linux Epoll vs Select/Poll in High-Throughput Gateways', 'Operating Systems', Difficulty.MEDIUM,
    'Why is Linux epoll significantly more scalable than select() and poll() for API gateways managing 50,000 concurrent sockets?',
    'select/poll require O(N) linear scanning of all file descriptors on every event. epoll uses an in-kernel red-black tree and event-driven callback queue to return only ready descriptors in O(1) time.',
    ['epoll', 'I/O Multiplexing', 'Event Loop', 'C10K Problem'],
    'Company-Targeted Practice', ['OS', 'Networking', 'Flipkart']);

  add('flipkart', 'Software Development Engineer', 'CDN Edge Caching and Cache-Control Headers', 'Computer Networks', Difficulty.EASY,
    'Explain how Cache-Control directives (max-age, s-maxage, stale-while-revalidate, must-revalidate) optimize web asset loading.',
    'max-age controls browser caching; s-maxage overrides TTL for shared proxy caches (CDNs); stale-while-revalidate serves cached copy while asynchronously refreshing from origin.',
    ['CDN', 'HTTP Caching', 'Edge Computing', 'Latency Optimization'],
    'Company-Targeted Practice', ['Networks', 'Web', 'Flipkart']);

  add('flipkart', 'Software Development Engineer', 'Strategy Pattern in E-Commerce Payment Gateways', 'OOP', Difficulty.EASY,
    'Implement a flexible payment processing engine supporting UPI, Credit Card, NetBanking, and Wallets using the Strategy pattern.',
    'Define a common PaymentStrategy interface with pay(amount). Concrete strategies implement provider-specific logic. The PaymentContext delegates execution dynamically at runtime.',
    ['Strategy Pattern', 'Polymorphism', 'Extensibility', 'Clean Architecture'],
    'Verified Historical', ['OOP', 'Design Patterns', 'Flipkart']);

  add('flipkart', 'Software Development Engineer', 'Message Queues: RabbitMQ vs Apache Kafka', 'Software Engineering', Difficulty.MEDIUM,
    'When would you choose RabbitMQ (smart broker, dumb consumer) versus Apache Kafka (dumb broker, smart consumer) in an e-commerce backend?',
    'RabbitMQ is best for complex transactional routing, priority queues, and individual message acknowledgments. Kafka is best for high-throughput append-only event streaming, event replay, and stream processing.',
    ['Kafka', 'RabbitMQ', 'Event Streaming', 'Message Queues'],
    'Verified Historical', ['Architecture', 'Messaging', 'Flipkart']);

  add('flipkart', 'Software Development Engineer', 'Java Concurrency: ConcurrentHashMap vs Collections.synchronizedMap', 'Programming Languages', Difficulty.MEDIUM,
    'Explain the lock striping and CAS mechanics that make ConcurrentHashMap fast under multi-threaded read/write workloads.',
    'synchronizedMap locks the entire map on every operation. ConcurrentHashMap uses lock-free volatile reads, CAS for empty bucket insertion, and fine-grained synchronized blocks on individual bucket heads.',
    ['ConcurrentHashMap', 'CAS (Compare-And-Swap)', 'Lock Striping', 'Java Concurrency'],
    'Verified Historical', ['Java', 'Concurrency', 'Flipkart']);

  add('flipkart', 'Software Development Engineer', 'Customer-First Resolution During a High-Stake Outage', 'HR & Behavioral', Difficulty.EASY,
    'Describe how you handled a situation where a software defect negatively impacted end-user transactions.',
    'Focus on rapid triage, customer refund/recovery policies, transparent post-incident communication, and automated regression guards.',
    ['Incident Triage', 'Customer Empathy', 'Resolution'],
    'Verified Historical', ['Behavioral', 'Flipkart']);

  add('flipkart', 'Software Development Engineer', 'Ownership and Bias for Action', 'HR & Behavioral', Difficulty.EASY,
    'Tell me about a time you took ownership of a critical issue outside your assigned deliverables.',
    'Demonstrate proactive leadership, unblocking cross-functional bottlenecks, and delivering value without waiting for managerial direction.',
    ['Ownership', 'Proactivity', 'Impact'],
    'Company-Targeted Practice', ['Behavioral', 'Flipkart']);

  // 6. Accenture (10 Questions)
  add('accenture', 'Associate Software Engineer', 'Two Sum in O(N) Time and Space', 'Data Structures & Algorithms', Difficulty.EASY,
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    'Store visited values and their indices in a hash map. For each number x, check if (target - x) exists in the map in O(1) time.',
    ['Hash Map', 'Two Sum', 'O(N) Complexity'],
    'Verified Historical', ['DSA', 'Arrays', 'Accenture']);

  add('accenture', 'Application Developer', 'Core OOP Principles Explained with Real-World Examples', 'OOP', Difficulty.EASY,
    'Explain Abstraction, Encapsulation, Inheritance, and Polymorphism with examples from an enterprise banking application.',
    'Encapsulation bundles data and methods; Abstraction exposes public APIs hiding internal complexity; Inheritance reuses base account functionality; Polymorphism enables custom interest calculations per account type.',
    ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism'],
    'Verified Historical', ['OOP', 'Core Java', 'Accenture']);

  add('accenture', 'Cloud Engineer', 'Monolithic vs Microservices Architecture Migration', 'Software Engineering', Difficulty.MEDIUM,
    'Explain the Strangler Fig pattern for migrating a legacy monolithic application to cloud microservices.',
    'Gradually replace specific business capabilities with new microservices routed through an API gateway until the monolith is retired without risky big-bang cutover.',
    ['Strangler Fig Pattern', 'Microservices', 'Cloud Migration'],
    'Verified Historical', ['Cloud', 'Architecture', 'Accenture']);

  add('accenture', 'Database Developer', 'SQL Joins & Performance Tuning (INNER, LEFT, RIGHT, FULL)', 'DBMS', Difficulty.EASY,
    'Explain the functional differences between SQL join types and how missing foreign key indexes degrade join performance.',
    'INNER returns matching rows from both tables; LEFT includes all left rows with null right matches; RIGHT includes all right rows; FULL includes both. Missing indexes trigger expensive nested loop full table scans.',
    ['SQL Joins', 'Index Tuning', 'Execution Plan'],
    'Verified Historical', ['DBMS', 'SQL', 'Accenture']);

  add('accenture', 'Software Engineer', 'DNS Resolution Flow and Common Record Types (A, CNAME, MX)', 'Computer Networks', Difficulty.EASY,
    'Explain how recursive DNS resolvers look up IP addresses and the difference between A, CNAME, and MX records.',
    'Browser checks cache -> OS resolver -> Root DNS -> TLD DNS -> Authoritative DNS. A maps domain to IPv4; CNAME maps domain to canonical alias; MX designates mail exchange servers.',
    ['DNS', 'A Record', 'CNAME', 'Networking'],
    'Company-Targeted Practice', ['Networks', 'DNS', 'Accenture']);

  add('accenture', 'Systems Engineer', 'Deadlock Detection vs Prevention in Operating Systems', 'Operating Systems', Difficulty.MEDIUM,
    'Explain the Banker\'s algorithm for deadlock avoidance in resource allocation.',
    'The Banker\'s algorithm tests for safety by simulating resource allocation for maximum possible claims, guaranteeing the system remains in a safe state with a valid execution sequence.',
    ['Banker\'s Algorithm', 'Safe State', 'Resource Allocation'],
    'Company-Targeted Practice', ['OS', 'Deadlock', 'Accenture']);

  add('accenture', 'Software Engineer', 'Agile Scrum Ceremonies and Sprint Lifecycles', 'Software Engineering', Difficulty.EASY,
    'Describe the responsibilities and goals of Sprint Planning, Daily Standup, Sprint Review, and Sprint Retrospective.',
    'Planning defines sprint backlog; Standups identify blockers; Review showcases working software to stakeholders; Retrospective focuses on team process improvements.',
    ['Agile', 'Scrum', 'Sprint Lifecycle'],
    'Verified Historical', ['SDLC', 'Agile', 'Accenture']);

  add('accenture', 'Java Developer', 'Java String Immutability and String Pool', 'Programming Languages', Difficulty.EASY,
    'Why is String immutable in Java and how does the String Constant Pool conserve heap memory?',
    'Immutability ensures thread safety, security for network credentials, and consistent hash codes for hash maps. The String Pool reuses identical literals to avoid redundant allocations.',
    ['String Pool', 'Immutability', 'Thread Safety'],
    'Verified Historical', ['Java', 'Memory', 'Accenture']);

  add('accenture', 'Associate Software Engineer', 'Handling Conflicting Team Priorities', 'HR & Behavioral', Difficulty.EASY,
    'Describe a situation where team members disagreed on task priority or technical approach. How did you resolve it?',
    'Highlight objective evaluation against client milestones, transparent communication, and consensus-driven alignment.',
    ['Teamwork', 'Conflict Resolution', 'Communication'],
    'Verified Historical', ['Behavioral', 'Accenture']);

  add('accenture', 'Associate Software Engineer', 'Adapting to New Technologies Quickly', 'HR & Behavioral', Difficulty.EASY,
    'How do you approach learning a completely new programming language or framework required for a client project?',
    'Demonstrate structured learning: reading documentation, building reference proof-of-concepts, reviewing best practices, and writing unit tests.',
    ['Continuous Learning', 'Adaptability', 'Growth'],
    'Company-Targeted Practice', ['Behavioral', 'Accenture']);

  // 7. TCS (10 Questions)
  add('tcs', 'Ninja / Digital Engineer', 'Find Missing Number in Array of 1 to N', 'Data Structures & Algorithms', Difficulty.EASY,
    'Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing from the array.',
    'Compute expected sum N*(N+1)/2 and subtract actual sum, or XOR all indices with all values in O(N) time and O(1) space.',
    ['Math', 'Bitwise XOR', 'O(1) Space'],
    'Verified Historical', ['DSA', 'Arrays', 'TCS']);

  add('tcs', 'Digital Software Engineer', 'Database Normalization: 1NF, 2NF, 3NF, BCNF', 'DBMS', Difficulty.EASY,
    'Explain the progression of database normalization forms from unnormalized to Boyce-Codd Normal Form with examples.',
    '1NF removes repeating groups (atomic values); 2NF eliminates partial dependencies on composite keys; 3NF removes transitive dependencies; BCNF enforces that every determinant is a candidate key.',
    ['1NF', '2NF', '3NF', 'BCNF', 'Dependencies'],
    'Verified Historical', ['DBMS', 'Normalization', 'TCS']);

  add('tcs', 'Digital Software Engineer', 'Method Overloading vs Method Overriding in Java', 'OOP', Difficulty.EASY,
    'Explain static (compile-time) polymorphism versus dynamic (runtime) polymorphism in Java with method signature rules.',
    'Overloading happens at compile time with same method name but different parameter list in same class. Overriding happens at runtime when child class provides custom implementation of inherited method with identical signature.',
    ['Compile-time Polymorphism', 'Runtime Polymorphism', 'Method Signature'],
    'Verified Historical', ['OOP', 'Java', 'TCS']);

  add('tcs', 'Systems Engineer', 'Process Scheduling Algorithms: FCFS, SJF, Round Robin', 'Operating Systems', Difficulty.EASY,
    'Compare Round Robin and Shortest Job First scheduling in terms of average waiting time and starvation risks.',
    'SJF achieves minimal theoretical average waiting time but risks starving long processes. Round Robin ensures fairness via time slices but incurs context switch overhead.',
    ['CPU Scheduling', 'Round Robin', 'SJF', 'Starvation'],
    'Verified Historical', ['OS', 'Scheduling', 'TCS']);

  add('tcs', 'Systems Engineer', 'TCP vs UDP Protocols and Use Cases', 'Computer Networks', Difficulty.EASY,
    'Compare TCP connection-oriented reliability with UDP connectionless speed across real-world enterprise applications.',
    'TCP provides guaranteed delivery, ordered byte stream, congestion control, and retransmissions (web, banking). UDP provides minimal latency with no retransmission overhead (video streaming, DNS, VoIP).',
    ['TCP', 'UDP', 'Reliability', 'Latency'],
    'Verified Historical', ['Networks', 'Protocols', 'TCS']);

  add('tcs', 'Digital Software Engineer', 'SDLC Models: Waterfall vs V-Model vs Agile', 'Software Engineering', Difficulty.EASY,
    'Compare the traditional Waterfall SDLC model with Agile development in large enterprise client deliveries.',
    'Waterfall is sequential and rigid with upfront requirements; Agile is iterative with short sprints, accommodating changing business requirements and early working deliverables.',
    ['SDLC', 'Waterfall', 'Agile', 'Software Quality'],
    'Company-Targeted Practice', ['Software Engineering', 'TCS']);

  add('tcs', 'Java Developer', 'Java Collections Framework Hierarchy', 'Programming Languages', Difficulty.EASY,
    'Describe the root interfaces of the Java Collections Framework (Collection, List, Set, Queue, Map) and their implementations.',
    'Collection is parent of List (ordered, duplicates), Set (unordered, unique), Queue (FIFO). Map is independent key-value structure. Key implementations: ArrayList, LinkedList, HashSet, TreeSet, HashMap, TreeMap.',
    ['Java Collections', 'List vs Set', 'HashMap', 'TreeSet'],
    'Verified Historical', ['Java', 'Collections', 'TCS']);

  add('tcs', 'Database Engineer', 'SQL ACID Properties and Transaction Integrity', 'DBMS', Difficulty.EASY,
    'Explain Atomicity, Consistency, Isolation, and Durability in relational database transactions.',
    'Atomicity guarantees all-or-nothing completion; Consistency preserves database invariants; Isolation shields concurrent transactions; Durability guarantees committed data survives server crashes.',
    ['ACID', 'Transaction Integrity', 'WAL (Write-Ahead Log)'],
    'Verified Historical', ['DBMS', 'Transactions', 'TCS']);

  add('tcs', 'Assistant System Engineer', 'Why Do You Want to Join TCS?', 'HR & Behavioral', Difficulty.EASY,
    'How does TCS align with your engineering career aspirations and learning roadmap?',
    'Highlight global training infrastructure, diverse industrial domains, learning certifications, and long-term stability.',
    ['Career Goals', 'Company Alignment', 'HR'],
    'Verified Historical', ['Behavioral', 'TCS']);

  add('tcs', 'Assistant System Engineer', 'Handling Work Pressure and Deadlines', 'HR & Behavioral', Difficulty.EASY,
    'Describe a situation during your college projects where you faced unexpected delays. How did you ensure timely completion?',
    'Discuss structured scheduling, breaking tasks into manageable sub-goals, and proactive communication with mentors.',
    ['Time Management', 'Pressure Handling', 'Accountability'],
    'Company-Targeted Practice', ['Behavioral', 'TCS']);

  // 8. Infosys (10 Questions)
  add('infosys', 'Specialist Programmer / SE', 'Longest Substring Without Repeating Characters', 'Data Structures & Algorithms', Difficulty.MEDIUM,
    'Given a string s, find the length of the longest substring without repeating characters.',
    'Use the sliding window technique with a hash set or character index array to advance the left pointer past duplicate occurrences in O(N) time.',
    ['Sliding Window', 'Hash Set', 'O(N) Time'],
    'Verified Historical', ['DSA', 'Strings', 'Infosys']);

  add('infosys', 'Software Engineer', 'Interface vs Abstract Class in Java 8+', 'OOP', Difficulty.EASY,
    'Explain the difference between an Abstract Class and an Interface in modern Java including default and static methods.',
    'Abstract classes can hold state (instance fields) and constructors; interfaces define contracts. Since Java 8, interfaces can provide default and static implementations, but still cannot maintain instance state.',
    ['Abstract Class', 'Interface', 'Default Methods', 'Java 8'],
    'Verified Historical', ['OOP', 'Java', 'Infosys']);

  add('infosys', 'Software Engineer', 'Primary Key vs Unique Key vs Candidate Key', 'DBMS', Difficulty.EASY,
    'Explain the relational schema constraints differentiating Candidate Keys, Primary Keys, and Unique Keys.',
    'Candidate keys are all minimal superkeys that uniquely identify a row. Primary Key is the chosen candidate key (cannot be NULL). Unique key allows one NULL value.',
    ['Primary Key', 'Unique Constraint', 'Candidate Key'],
    'Verified Historical', ['DBMS', 'Keys', 'Infosys']);

  add('infosys', 'Software Engineer', 'Virtual Memory, Swapping, and Thrashing', 'Operating Systems', Difficulty.MEDIUM,
    'What causes operating system thrashing and how does the working set model prevent it?',
    'Thrashing occurs when memory is overcommitted and processes spend more time paging data between RAM and disk than executing code. The working set model monitors pages actively needed by each process.',
    ['Thrashing', 'Paging', 'Working Set Model', 'Page Faults'],
    'Verified Historical', ['OS', 'Memory Management', 'Infosys']);

  add('infosys', 'Software Engineer', 'IPv4 Subnetting and Classless Inter-Domain Routing (CIDR)', 'Computer Networks', Difficulty.EASY,
    'Explain how CIDR notation (e.g. /24, /28) determines network and host address allocations.',
    'CIDR uses variable-length subnet masks. A /24 allocates 8 bits for hosts (256 addresses, 254 usable); a /28 allocates 4 bits for hosts (16 addresses, 14 usable).',
    ['CIDR', 'Subnet Mask', 'IPv4 Addressing'],
    'Company-Targeted Practice', ['Networks', 'Subnetting', 'Infosys']);

  add('infosys', 'Software Engineer', 'REST API Best Practices and Status Codes', 'Software Engineering', Difficulty.EASY,
    'Explain standard HTTP response codes for successful resource creation (201), validation failure (400), authentication failure (401), authorization failure (403), and resource missing (404).',
    '201 Created for new entities; 400 Bad Request for validation errors; 401 Unauthorized for missing/invalid token; 403 Forbidden for insufficient permissions; 404 Not Found for missing endpoints.',
    ['REST API', 'HTTP Status Codes', 'API Design'],
    'Verified Historical', ['Web', 'REST', 'Infosys']);

  add('infosys', 'Java Developer', 'Java Memory Leaks and Weak References', 'Programming Languages', Difficulty.MEDIUM,
    'Can memory leaks occur in Java despite automatic garbage collection? Give 2 common causes.',
    'Yes: static collections holding references indefinitely, unclosed database/network connections, and forgotten event listeners/callbacks.',
    ['Memory Leaks', 'Garbage Collector', 'Static References'],
    'Verified Historical', ['Java', 'Memory', 'Infosys']);

  add('infosys', 'Database Developer', 'SQL Stored Procedures vs Functions', 'DBMS', Difficulty.EASY,
    'Compare SQL Stored Procedures and User-Defined Functions in database design.',
    'Stored procedures can execute DML, transaction control (COMMIT/ROLLBACK), and return zero or multiple output parameters. Functions must return a value and cannot modify database state.',
    ['Stored Procedures', 'Functions', 'SQL DML'],
    'Company-Targeted Practice', ['DBMS', 'SQL', 'Infosys']);

  add('infosys', 'Software Engineer', 'Handling Constructive Feedback from Code Reviews', 'HR & Behavioral', Difficulty.EASY,
    'Describe an instance where a senior reviewer requested significant changes to your implementation. How did you react?',
    'Emphasize keeping code separate from ego, seeking clarity on architectural intent, and adopting team standards.',
    ['Code Review', 'Constructive Feedback', 'Humility'],
    'Verified Historical', ['Behavioral', 'Infosys']);

  add('infosys', 'Software Engineer', 'Willingness to Relocate and Adaptability', 'HR & Behavioral', Difficulty.EASY,
    'Are you comfortable working in different locations and cross-functional technology domains?',
    'Demonstrate enthusiasm for learning diverse domains, geographical mobility, and client delivery readiness.',
    ['Adaptability', 'Mobility', 'Company Fit'],
    'Company-Targeted Practice', ['Behavioral', 'Infosys']);

  // 9. Wipro (10 Questions)
  add('wipro', 'Project Engineer', 'Check for Balanced Parentheses', 'Data Structures & Algorithms', Difficulty.EASY,
    'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid using a stack.',
    'Push opening brackets onto a stack. When encountering closing bracket, pop top and verify match. Return true if stack is empty at end.',
    ['Stack', 'Strings', 'Parentheses Matching'],
    'Verified Historical', ['DSA', 'Stacks', 'Wipro']);

  add('wipro', 'Software Developer', 'Java Exception Hierarchy: Checked vs Unchecked Exceptions', 'Programming Languages', Difficulty.EASY,
    'Explain the inheritance hierarchy under Throwable and why RuntimeException is unchecked.',
    'Throwable has Error and Exception. Checked exceptions extend Exception and must be handled or declared. Unchecked exceptions extend RuntimeException and indicate programmer logic errors.',
    ['Exceptions', 'Checked vs Unchecked', 'Throwable', 'Java'],
    'Verified Historical', ['Java', 'Exceptions', 'Wipro']);

  add('wipro', 'Database Developer', 'SQL Group By vs Having Clauses', 'DBMS', Difficulty.EASY,
    'What is the functional difference between WHERE and HAVING in SQL queries with aggregation?',
    'WHERE filters individual rows before aggregation occurs; HAVING filters aggregated groups after the GROUP BY calculation.',
    ['SQL', 'GROUP BY', 'HAVING vs WHERE', 'Aggregation'],
    'Verified Historical', ['DBMS', 'SQL', 'Wipro']);

  add('wipro', 'Systems Engineer', 'Paging vs Segmentation in Memory Management', 'Operating Systems', Difficulty.EASY,
    'Compare fixed-size physical paging with variable-size logical segmentation in OS memory management.',
    'Paging divides virtual memory into fixed-size pages, eliminating external fragmentation. Segmentation divides memory into logical modules (code, stack, data) with variable sizes, suffering from external fragmentation.',
    ['Paging', 'Segmentation', 'Memory Management'],
    'Verified Historical', ['OS', 'Memory', 'Wipro']);

  add('wipro', 'Network Engineer', 'TCP 3-Way Handshake and 4-Way Connection Teardown', 'Computer Networks', Difficulty.EASY,
    'Explain the SYN, SYN-ACK, ACK handshake and the FIN, ACK, FIN, ACK termination sequence in TCP.',
    'Handshake synchronizes initial sequence numbers (ISN). Teardown gracefully closes half-connections with FIN packets, entering TIME_WAIT state to guarantee delivery of final ACK.',
    ['TCP Handshake', 'TIME_WAIT', 'Connection Teardown'],
    'Verified Historical', ['Networks', 'TCP', 'Wipro']);

  add('wipro', 'Software Developer', 'Singleton Pattern Implementation in Java (Thread-Safe)', 'OOP', Difficulty.MEDIUM,
    'Implement a thread-safe Singleton in Java using double-checked locking with the volatile keyword.',
    'Double-checked locking checks instance twice with synchronized block. Volatile keyword prevents instruction reordering during object instantiation.',
    ['Singleton Pattern', 'Volatile', 'Double-Checked Locking', 'Thread Safety'],
    'Verified Historical', ['OOP', 'Design Patterns', 'Wipro']);

  add('wipro', 'QA / Test Engineer', 'Unit Testing vs Integration Testing vs End-to-End Testing', 'Software Engineering', Difficulty.EASY,
    'Explain the Test Pyramid and the roles of Unit Tests, Integration Tests, and E2E Tests in CI/CD pipelines.',
    'Unit tests verify isolated functions fast; Integration tests verify service/database interactions; E2E tests validate complete user journeys across frontend and backend.',
    ['Test Pyramid', 'Unit Testing', 'CI/CD', 'Quality Assurance'],
    'Company-Targeted Practice', ['Testing', 'SDLC', 'Wipro']);

  add('wipro', 'Web Developer', 'SQL Injection and Prevention via Prepared Statements', 'Security & Web', Difficulty.EASY,
    'How does SQL injection occur when concatenating queries, and how do parameterized queries completely neutralize it?',
    'Concatenating raw input allows attackers to manipulate query AST. Parameterized queries pre-compile SQL syntax and treat inputs strictly as literal values.',
    ['SQL Injection', 'Prepared Statements', 'Security', 'OWASP'],
    'Verified Historical', ['Security', 'DBMS', 'Wipro']);

  add('wipro', 'Project Engineer', 'Strengths and Areas of Improvement', 'HR & Behavioral', Difficulty.EASY,
    'What are your greatest technical strengths and one genuine area you are actively working to improve?',
    'Highlight structured problem-solving and eagerness to learn, and present an improvement area with concrete active steps taken.',
    ['Self Awareness', 'Strengths & Weaknesses', 'Personal Growth'],
    'Verified Historical', ['Behavioral', 'Wipro']);

  add('wipro', 'Project Engineer', 'Working in Shift Rotations or Diverse Projects', 'HR & Behavioral', Difficulty.EASY,
    'Are you willing to work flexible shifts or support 24/7 enterprise production support environments?',
    'Demonstrate professionalism, dedication to client reliability, and flexibility in supporting operational needs.',
    ['Flexibility', 'Commitment', 'Operational Readiness'],
    'Company-Targeted Practice', ['Behavioral', 'Wipro']);

  // 10. Deloitte (10 Questions)
  add('deloitte', 'Technology Consultant', 'Cloud Shared Responsibility Model (IaaS, PaaS, SaaS)', 'Cloud & Architecture', Difficulty.EASY,
    'Explain how security and operational responsibilities divide between cloud providers and clients across IaaS, PaaS, and SaaS.',
    'In IaaS, client manages OS, runtime, and data. In PaaS, provider manages OS and runtime while client manages app and data. In SaaS, provider manages entire stack while client configures access and data.',
    ['Shared Responsibility Model', 'IaaS vs PaaS vs SaaS', 'Cloud Security'],
    'Verified Historical', ['Cloud', 'Deloitte']);

  add('deloitte', 'Software Consultant', 'Merge Intervals', 'Data Structures & Algorithms', Difficulty.MEDIUM,
    'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.',
    'Sort intervals by start time. Iterate and merge overlapping intervals if current start <= previous end, otherwise append a new interval in O(N log N) time.',
    ['Intervals', 'Sorting', 'Greedy'],
    'Verified Historical', ['DSA', 'Arrays', 'Deloitte']);

  add('deloitte', 'Database Specialist', 'Database Isolation Levels & Concurrency Anomalies', 'DBMS', Difficulty.MEDIUM,
    'Define Read Uncommitted, Read Committed, Repeatable Read, and Serializable, and the anomalies they prevent (Dirty Read, Non-Repeatable Read, Phantom Read).',
    'Read Uncommitted allows dirty reads. Read Committed prevents dirty reads using short read locks. Repeatable Read prevents non-repeatable reads using MVCC/shared locks. Serializable prevents phantom reads using range/predicate locks.',
    ['Isolation Levels', 'Dirty Read', 'Phantom Read', 'ACID'],
    'Verified Historical', ['DBMS', 'Transactions', 'Deloitte']);

  add('deloitte', 'Solutions Architect', 'Enterprise API Gateway Roles (Auth, Throttling, Logging)', 'System Design', Difficulty.MEDIUM,
    'What are the core responsibilities of an API Gateway in enterprise service architectures?',
    'API Gateway handles reverse proxying, JWT/OAuth2 token validation, rate limiting, request transformation, SSL termination, and centralized observability metrics.',
    ['API Gateway', 'OAuth2', 'Rate Limiting', 'Reverse Proxy'],
    'Company-Targeted Practice', ['System Design', 'Enterprise', 'Deloitte']);

  add('deloitte', 'Technology Consultant', 'Public Key Infrastructure (PKI) and SSL Certificates', 'Computer Networks', Difficulty.MEDIUM,
    'How do asymmetric public-private key cryptography and Certificate Authorities (CAs) establish trust in HTTPS connections?',
    'CA signs server certificate with its private key. Client verifies signature using CA\'s trusted root certificate. Client and server use asymmetric encryption to negotiate symmetric session keys.',
    ['PKI', 'Asymmetric Cryptography', 'TLS/SSL', 'Certificates'],
    'Verified Historical', ['Security', 'Networks', 'Deloitte']);

  add('deloitte', 'Software Consultant', 'SOLID Principles in Enterprise Java/Spring', 'OOP', Difficulty.EASY,
    'Demonstrate how Spring Boot Dependency Injection implements the Inversion of Control (IoC) and Open/Closed Principle.',
    'Spring IoC container instantiates and injects interface dependencies at runtime via @Autowired, allowing new implementations to be added without modifying existing consumer code.',
    ['Spring Boot', 'IoC Container', 'Dependency Injection', 'SOLID'],
    'Verified Historical', ['OOP', 'Spring', 'Deloitte']);

  add('deloitte', 'Systems Consultant', 'Virtual Machine Hypervisors: Type 1 vs Type 2', 'Operating Systems', Difficulty.EASY,
    'Compare bare-metal Type 1 hypervisors (ESXi, KVM) with hosted Type 2 hypervisors (VirtualBox, VMware Workstation).',
    'Type 1 runs directly on hardware with minimal overhead and maximum performance for cloud datacenters. Type 2 runs on top of host OS with additional abstraction layers, suited for desktop development.',
    ['Hypervisors', 'Virtualization', 'Type 1 vs Type 2', 'KVM'],
    'Company-Targeted Practice', ['OS', 'Virtualization', 'Deloitte']);

  add('deloitte', 'Data Consultant', 'Data Warehouse vs Data Lake vs Lakehouse Architecture', 'DBMS', Difficulty.MEDIUM,
    'Compare structured Data Warehouses (Snowflake, BigQuery), raw Data Lakes (S3, HDFS), and modern Lakehouses.',
    'Warehouses store structured relational data with high query speed. Lakes store raw multi-format data at low cost. Lakehouses combine ACID transactions on object storage using open table formats.',
    ['Data Warehouse', 'Data Lake', 'Data Lakehouse', 'Big Data'],
    'Company-Targeted Practice', ['Data', 'Architecture', 'Deloitte']);

  add('deloitte', 'Technology Consultant', 'Client Presentation and Managing Stakeholder Expectations', 'HR & Behavioral', Difficulty.EASY,
    'How do you explain a complex technical trade-off to non-technical business stakeholders?',
    'Focus on business impact, risk mitigation, cost, and timelines rather than implementation minutiae, using intuitive analogies.',
    ['Stakeholder Management', 'Communication', 'Consulting'],
    'Verified Historical', ['Behavioral', 'Deloitte']);

  add('deloitte', 'Technology Consultant', 'Leading a Team Through Project Uncertainty', 'HR & Behavioral', Difficulty.EASY,
    'Describe a situation where a client changed requirements midway through development. How did you realign the team?',
    'Discuss impact analysis, scope negotiation, transparent backlog re-prioritization, and maintaining team morale.',
    ['Leadership', 'Change Management', 'Agile'],
    'Company-Targeted Practice', ['Behavioral', 'Deloitte']);

  // 11. HSBC (10 Questions)
  add('hsbc', 'Software Engineer', 'Design a High-Throughput Ledger Transaction Engine', 'System Design', Difficulty.HARD,
    'Design a double-entry banking ledger that guarantees zero lost updates and complete transaction auditability under heavy concurrent transfers.',
    'Double-entry bookkeeping requires equal debit and credit balances. Enforce optimistic concurrency control or row-level locking ordered by account ID to prevent deadlocks, backed by append-only immutable audit logs.',
    ['Double-Entry Bookkeeping', 'Optimistic Locking', 'Audit Trail', 'Financial Systems'],
    'Verified Historical', ['System Design', 'FinTech', 'HSBC']);

  add('hsbc', 'Software Engineer', 'Kth Largest Element in an Array', 'Data Structures & Algorithms', Difficulty.MEDIUM,
    'Given an integer array nums and an integer k, return the kth largest element in the array using a Min-Heap.',
    'Maintain a min-heap of size k. Push elements into heap; if size exceeds k, pop the minimum. The root of the heap contains the kth largest element in O(N log K) time.',
    ['Priority Queue', 'Min-Heap', 'O(N log K)'],
    'Verified Historical', ['DSA', 'Heaps', 'HSBC']);

  add('hsbc', 'Software Engineer', 'Deadlock Avoidance in Financial Transfers', 'Operating Systems', Difficulty.MEDIUM,
    'How do you prevent deadlocks when two concurrent threads transfer funds between Account A and Account B simultaneously?',
    'Enforce a strict global lock acquisition ordering (e.g., always acquire lock on smaller account ID first, then larger account ID). This eliminates circular wait conditions.',
    ['Deadlock Prevention', 'Lock Ordering', 'Circular Wait', 'Concurrency'],
    'Verified Historical', ['OS', 'Concurrency', 'HSBC']);

  add('hsbc', 'Database Specialist', 'Database Sharding & Read Replicas with Read-Your-Own-Writes Consistency', 'DBMS', Difficulty.MEDIUM,
    'How do you handle replication lag when a user deposits money and immediately refreshes their balance view?',
    'Route read requests to the master database for a brief window after writes, or use session tokens tracking write timestamps to wait for replica catch-up.',
    ['Replication Lag', 'Read-Your-Own-Writes', 'Master-Replica', 'Consistency'],
    'Verified Historical', ['DBMS', 'Transactions', 'HSBC']);

  add('hsbc', 'Security & Network Engineer', 'Mutual TLS (mTLS) Authentication in Banking APIs', 'Computer Networks', Difficulty.MEDIUM,
    'How does Mutual TLS (mTLS) provide zero-trust security between microservices compared to standard one-way TLS?',
    'In standard TLS, only server presents a certificate. In mTLS, both client and server exchange and cryptographically verify each other\'s X.509 certificates against trusted internal root CAs.',
    ['mTLS', 'Zero Trust', 'X.509 Certificates', 'API Security'],
    'Verified Historical', ['Networks', 'Security', 'HSBC']);

  add('hsbc', 'Software Engineer', 'Immutable Object Pattern in Financial Domains', 'OOP', Difficulty.EASY,
    'Why must monetary values (e.g. Money, Currency) always be modeled as immutable Value Objects rather than mutable entities?',
    'Immutability guarantees thread safety, eliminates side-effect bugs, ensures consistent hash codes for indexing, and prevents accidental currency/amount tampering.',
    ['Immutable Objects', 'Value Object', 'Domain-Driven Design', 'Thread Safety'],
    'Company-Targeted Practice', ['OOP', 'DDD', 'HSBC']);

  add('hsbc', 'Software Engineer', 'Event Sourcing and CQRS in Financial Systems', 'Software Engineering', Difficulty.HARD,
    'Explain how Event Sourcing and Command Query Responsibility Segregation (CQRS) guarantee audit compliance in banking.',
    'Event Sourcing stores all state changes as immutable append-only events. CQRS separates write models from read models optimized for fast reporting, enabling historical replay and compliance audit.',
    ['Event Sourcing', 'CQRS', 'Audit Log', 'Eventual Consistency'],
    'Verified Historical', ['Architecture', 'FinTech', 'HSBC']);

  add('hsbc', 'Software Engineer', 'BigDecimal vs Float/Double for Financial Calculations', 'Programming Languages', Difficulty.EASY,
    'Why is using float or double strictly forbidden for currency calculations in banking software?',
    'Binary floating-point types (IEEE 754) cannot accurately represent base-10 decimals like 0.1, introducing cumulative rounding errors. BigDecimal performs exact arbitrary-precision decimal arithmetic.',
    ['BigDecimal', 'IEEE 754', 'Floating-Point Inaccuracy', 'Rounding Rules'],
    'Verified Historical', ['Java', 'Math', 'HSBC']);

  add('hsbc', 'Software Engineer', 'Adhering to Regulatory Compliance and Security Policies', 'HR & Behavioral', Difficulty.EASY,
    'Describe a situation where regulatory constraints or data privacy rules restricted your technical choices. How did you navigate it?',
    'Discuss embracing privacy-by-design (GDPR, PCI-DSS), collaborating with compliance officers, and architecting compliant data tokenization.',
    ['Compliance', 'PCI-DSS', 'Data Privacy', 'Banking Standards'],
    'Verified Historical', ['Behavioral', 'HSBC']);

  add('hsbc', 'Software Engineer', 'Long-Term Reliability Over Quick Hacks', 'HR & Behavioral', Difficulty.EASY,
    'How do you ensure enterprise systems remain robust, maintainable, and bug-free over 5-10 year lifecycles?',
    'Focus on thorough automated unit/integration testing, clear architectural documentation, loose coupling, and defensive programming.',
    ['Maintainability', 'Engineering Excellence', 'Defensive Programming'],
    'Company-Targeted Practice', ['Behavioral', 'HSBC']);

  return list;
}

export const companyQuestionsData: QuestionSeed[] = generateCompanyQuestions();
