// src/data/mockData.ts
import {
  StudentProfile,
  InterviewSession,
  BookmarkItem,
  CompanyQuestion,
  ResourceItem,
  CodingProblem
} from '../types/prepai';

export const mockStudentProfile: StudentProfile = {
  id: 'usr_21075042',
  fullName: 'Rahul Sharma',
  initials: 'RS',
  rollNumber: '21075042',
  email: 'rahul.sharma@eng.univ.edu',
  phone: '+91 98765 43210',
  institution: 'Indian Institute of Technology (BHU), Varanasi',
  degree: 'B.Tech',
  branch: 'CSE',
  academicYear: 4,
  semester: 7,
  graduationYear: 2025,
  cgpa: 8.92,
  mfaActive: true,
  streakDays: 14,
  readinessIndex: 86.4,
  targetRoles: ['Systems Software Engineer (L4)', 'Distributed Storage Engineer', 'Backend SDE-1 / SDE-2'],
  targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Qualcomm', 'Nvidia'],
  targetCompensation: '₹25,00,000 – ₹50,00,000+ LPA',
  skills: {
    languages: [
      { name: 'C++20', level: 'Expert' },
      { name: 'Golang', level: 'Advanced' },
      { name: 'Python 3.11', level: 'Proficient' },
      { name: 'TypeScript', level: 'Working' },
      { name: 'SQL / Relational Schema', level: 'Proficient' }
    ],
    systems: [
      'gRPC & Protobuf',
      'Tokio Async Runtime',
      'Redis-Go Client',
      'Linux eBPF',
      'Docker Engine',
      'Kubernetes Operators'
    ],
    theory: [
      'Distributed Consensus (Raft / Paxos)',
      'Kernel Concurrency (Locks, Atomics)',
      'LSM Tree Storage (SSTables & WAL)'
    ]
  }
};

export const mockInterviewHistory: InterviewSession[] = [
  {
    id: 'int_01',
    title: 'Google L4 SWE — Systems & Infrastructure Loop',
    company: 'Google',
    role: 'Systems & Infrastructure (L4)',
    roundType: 'Technical Architecture',
    difficulty: 'Hard (L4+)',
    date: 'Yesterday, Oct 24',
    durationMinutes: 42,
    overallScore: 92.0,
    technicalScore: 94,
    structureScore: 90,
    completenessScore: 88,
    clarityScore: 90,
    status: 'Completed',
    feedbackSummary: 'Exceptional mastery of Bloom filter sizing in RocksDB and replica tail-latency mitigation. Clear articulation of P99 tail distribution tradeoffs.',
    questions: [
      {
        prompt: 'Explain how you would optimize a search operation on a large distributed dataset exceeding 50 TB, where reads are latency-sensitive (p99 < 15ms) and keys follow a heavy-tailed Zipfian distribution.',
        score: 92.0,
        candidateAnswer: 'To mitigate compaction stalls in Level 0 to Level 1, we decouple disk I/O with tiered sub-compactions and configure dynamic bloom filters at 10 bits/key. For Zipfian hotspots, an in-memory LRU-2 cache absorbs 80% read throughput...',
        examinerNote: 'Accurately addressed write amplification factor and pointed out rate-limiting hedged read probes.'
      }
    ]
  },
  {
    id: 'int_02',
    title: 'Amazon SDE-2 — Distributed Rate Limiter & Concurrency',
    company: 'Amazon',
    role: 'SDE-2 (AWS Core)',
    roundType: 'System Design',
    difficulty: 'Hard',
    date: 'Oct 18, 2024',
    durationMinutes: 38,
    overallScore: 88.5,
    technicalScore: 90,
    structureScore: 88,
    completenessScore: 86,
    clarityScore: 89,
    status: 'Completed',
    feedbackSummary: 'Solid distributed synchronization logic. Improve edge-case handling on NTP clock skew and Redis shard failures.',
    questions: [
      {
        prompt: 'Design a distributed rate limiter supporting 1,000,000 requests per second across 5 AWS regions with sliding window counter granularity.',
        score: 88.5,
        candidateAnswer: 'We used Redis cluster running Lua script sliding window counters with asynchronous batching via memory-mapped ring buffers.',
        examinerNote: 'Strong Redis Lua implementation. Mentioned eventual consistency replication trade-offs.'
      }
    ]
  },
  {
    id: 'int_03',
    title: 'Microsoft Core OS / Azure — Lock-Free Ring Buffer',
    company: 'Microsoft',
    role: 'Systems Engineer',
    roundType: 'Kernel Concurrency',
    difficulty: 'Hard (L5 CORE)',
    date: 'Oct 12, 2024',
    durationMinutes: 45,
    overallScore: 94.2,
    technicalScore: 96,
    structureScore: 92,
    completenessScore: 94,
    clarityScore: 95,
    status: 'Completed',
    feedbackSummary: 'Flawless proof of sequentially consistent vs acquire/release memory orderings. Prevented false sharing without prompt.',
    questions: [
      {
        prompt: 'Implement a lock-free Single Producer Single Consumer (SPSC) ring buffer in C++20 using atomic indices and proper cache line padding.',
        score: 94.2,
        candidateAnswer: 'Alignas(64) cache-line separation on head and tail atomic positions with std::memory_order_release on write and acquire on read.',
        examinerNote: 'Zero memory tearing or false cache invalidation. Production grade implementation.'
      }
    ]
  },
  {
    id: 'int_04',
    title: 'Qualcomm Modem Firmware — Dual-Clock FIFO & Metastability',
    company: 'Qualcomm',
    role: 'Firmware Engineer (5G Baseband)',
    roundType: 'Hardware Interface',
    difficulty: 'Hard',
    date: 'Oct 04, 2024',
    durationMinutes: 40,
    overallScore: 86.0,
    technicalScore: 88,
    structureScore: 84,
    completenessScore: 85,
    clarityScore: 87,
    status: 'Completed',
    feedbackSummary: 'Good understanding of 2-stage synchronizer flip-flops and Gray code pointers for CDC.',
    questions: []
  }
];

export const mockBookmarks: BookmarkItem[] = [
  {
    id: 'bm_01',
    title: 'Design a High-Throughput Distributed Rate Limiter with Sliding Window Counter',
    category: 'Coding Practice',
    branch: 'CSE',
    difficulty: 'Hard',
    tags: ['Distributed Systems', 'Concurrency', 'Redis Lua'],
    targetCompany: 'Google, Uber',
    savedDate: '2 days ago',
    type: 'code'
  },
  {
    id: 'bm_02',
    title: 'Concurrent LRU Cache with O(1) Eviction & Lock Striping',
    category: 'Coding Practice',
    branch: 'CSE',
    difficulty: 'Medium',
    tags: ['OS & Multithreading', 'C++20'],
    targetCompany: 'Microsoft Azure',
    savedDate: '5 days ago',
    type: 'code'
  },
  {
    id: 'bm_03',
    title: 'Clock Domain Crossing (CDC) Synchronization & Metastability in Dual-Clock FIFO',
    category: 'Company Questions',
    branch: 'ECE',
    difficulty: 'Hard',
    tags: ['Digital VLSI', 'Hardware-Software Interface'],
    targetCompany: 'Qualcomm, Nvidia',
    savedDate: '1 week ago',
    type: 'doc'
  },
  {
    id: 'bm_04',
    title: 'Operating Systems: Three Easy Pieces (OSTEP) — Comprehensive Lecture Notes & Concurrency Sets',
    category: 'Preparation Resources',
    branch: 'CSE',
    tags: ['PDF Compendium', 'Univ of Wisconsin', 'Free Book'],
    savedDate: '2 weeks ago',
    type: 'compendium'
  },
  {
    id: 'bm_05',
    title: 'Google L4 Infrastructure Loop: Bloom Filter & LSM-Tree Compaction Archetypes',
    category: 'Company Questions',
    branch: 'CSE',
    difficulty: 'Hard',
    tags: ['Storage Engines', 'RocksDB', 'Tail Latency'],
    targetCompany: 'Google',
    savedDate: '3 weeks ago',
    type: 'doc'
  }
];

export const mockCompanyQuestions: CompanyQuestion[] = [
  {
    id: 'cq_01',
    company: 'Google',
    role: 'Software Engineer L4 / Infrastructure',
    title: 'Design a Distributed Rate Limiter with Sliding Window Counter & Redis Lua Scripting',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['Distributed Systems', 'Redis', 'Concurrency', 'Sliding Window'],
    frequency: 'Very High',
    lastAsked: 'Asked 3 days ago in Google L4 Campus Loop',
    provenance: 'Verified Historical',
    solutionSummary: 'Combine localized memory-mapped ring buffers with Redis atomic Lua scripts to maintain exact sub-second sliding windows with low write amplification.',
    keyConcepts: ['Token Bucket vs Leaky Bucket', 'Sliding Window Counter', 'Redis Sharded Cluster', 'Network Partitions'],
    acceptanceRate: '28.4%'
  },
  {
    id: 'cq_02',
    company: 'Google',
    role: 'Site Reliability / Systems SWE',
    title: 'Mitigating Tail Latency in Tiered Microservices with Client-Side Hedged Probes',
    difficulty: 'Hard',
    category: 'Operating Systems & Networking',
    tags: ['Tail Latency', 'P99', 'gRPC', 'Distributed Consensus'],
    frequency: 'High',
    lastAsked: 'Oct 2024 placement cycle',
    provenance: 'Verified Historical',
    solutionSummary: 'Deploy hedged requests after P95 cutoff threshold to curb JVM garbage collection pauses and network micro-burst tail latency.',
    keyConcepts: ['Dean & Barroso Tail at Scale', 'Hedged Requests', 'Concurrent Cancellation', 'Timeout Budgets'],
    acceptanceRate: '34.2%'
  },
  {
    id: 'cq_03',
    company: 'Microsoft',
    role: 'Azure Core / Kernel Engineer',
    title: 'Lock-Free Ring Buffer (SPSC / MPMC) with Cache Line Padding and Memory Fences',
    difficulty: 'Hard',
    category: 'Kernel Concurrency',
    tags: ['C++20', 'Atomic Memory Order', 'False Sharing', 'Ring Buffer'],
    frequency: 'Very High',
    lastAsked: '1 week ago in Microsoft IDC drive',
    provenance: 'Verified Historical',
    solutionSummary: 'Enforce hardware cache line alignment (alignas(64)) between read/write pointers and utilize acquire/release memory semantics.',
    keyConcepts: ['Memory Ordering (Acquire/Release)', 'Cache Line Bouncing', 'MESI Protocol', 'Wait-Free Progress'],
    acceptanceRate: '22.1%'
  },
  {
    id: 'cq_04',
    company: 'Amazon',
    role: 'SDE-2 AWS DynamoDB Team',
    title: 'LSM-Tree Write Stall Prevention & Leveled Compaction Tuning',
    difficulty: 'Hard',
    category: 'Storage Engines',
    tags: ['LSM Trees', 'RocksDB', 'Write Amplification', 'Compaction'],
    frequency: 'Very High',
    lastAsked: '2 weeks ago in Amazon AWS Core Loop',
    provenance: 'Candidate Reported',
    solutionSummary: 'Dynamically adapt write buffer flush thread pools and decouple SSTable compactions with tiered sub-compactions.',
    keyConcepts: ['Write Amplification Factor (WAF)', 'Bloom Filters', 'SSTables & WAL', 'Compaction Concurrency'],
    acceptanceRate: '31.5%'
  },
  {
    id: 'cq_05',
    company: 'Qualcomm',
    role: 'Firmware & Baseband DSP',
    title: 'Dual-Clock Asynchronous FIFO Design & Gray Code Synchronization',
    difficulty: 'Hard',
    category: 'Digital Systems & VLSI',
    tags: ['CDC', 'Gray Code', 'Metastability', 'Dual-Clock FIFO'],
    frequency: 'High',
    lastAsked: 'Sep 2024 campus interview',
    provenance: 'AI Calibrated',
    solutionSummary: 'Convert binary read/write pointers to Gray code prior to 2-flip-flop synchronizers to guarantee single-bit transitions and prevent metastability.',
    keyConcepts: ['Mean Time Between Failures (MTBF)', 'Gray Code Converters', 'Full & Empty Flag Generation', 'Setup/Hold Slack'],
    acceptanceRate: '41.0%'
  },
  {
    id: 'cq_06',
    company: 'Nvidia',
    role: 'Compute Architecture Engineer',
    title: 'CUDA Warp Divergence & Memory Coalescing Optimization in Matrix Multiplication',
    difficulty: 'Hard',
    category: 'Parallel Systems',
    tags: ['GPU Architecture', 'CUDA', 'Warp Divergence', 'Shared Memory'],
    frequency: 'High',
    lastAsked: 'Oct 2024 Nvidia Hardware Loop',
    provenance: 'Verified Historical',
    solutionSummary: 'Tile matrix data into 16KB shared memory blocks and structure threads so memory transactions coalesce into single 128-byte DRAM cache lines.',
    keyConcepts: ['SIMT Execution Model', 'Shared Memory Bank Conflicts', 'Warp Scheduling', 'Tiling & Registers'],
    acceptanceRate: '26.8%'
  }
];

export const mockResources: ResourceItem[] = [
  {
    id: 'res_01',
    title: 'Operating Systems: Three Easy Pieces (OSTEP) — Complete Lecture Compendium & Concurrency Problem Sets',
    category: 'Operating Systems',
    branch: 'CSE',
    semester: 5,
    subject: 'Operating Systems',
    format: 'Compendium',
    pages: 420,
    fileSize: '14.8 MB',
    author: 'Prof. Remzi Arpaci-Dusseau (Univ of Wisconsin)',
    upvotes: 842,
    downloads: 3240,
    isVerified: true,
    description: 'The definitive text on Virtualization (CPU & Memory), Concurrency (Threads, Locks, Semaphores, Condition Variables), and Persistence (I/O, Disks, RAID, File Systems).'
  },
  {
    id: 'res_02',
    title: 'GATE CSE 10-Year Chapterwise Solved Question Papers (2014–2024) with Formal Proofs',
    category: 'Competitive & Placements',
    branch: 'CSE',
    semester: 7,
    subject: 'GATE PYQs',
    format: 'GATE PYQs',
    pages: 580,
    fileSize: '24.2 MB',
    author: 'PrepAI Academic Consortium & IIT Faculty',
    upvotes: 1290,
    downloads: 5120,
    isVerified: true,
    description: 'Exhaustive chapter-wise solutions for Algorithms, Data Structures, Theory of Computation, Compiler Design, Database Management Systems, and Computer Organization.'
  },
  {
    id: 'res_03',
    title: 'Distributed Systems: Principles & Paradigms (Tanenbaum / Van Steen) Condensed Revision Notes',
    category: 'Distributed Systems',
    branch: 'CSE',
    semester: 6,
    subject: 'Distributed Systems',
    format: 'PDF',
    pages: 185,
    fileSize: '8.4 MB',
    author: 'MIT 6.824 Distributed Systems TAs',
    upvotes: 620,
    downloads: 2180,
    isVerified: true,
    description: 'Concise lecture summaries covering Raft consensus, Byzantine fault tolerance, vector clocks, RPC semantics, and consistency models (linearizability vs eventual).'
  },
  {
    id: 'res_04',
    title: 'Computer Networks (Tanenbaum) Top 100 Technical Interview Questions & WireShark Captures',
    category: 'Computer Networks',
    branch: 'CSE',
    semester: 5,
    subject: 'Computer Networks',
    format: 'Cheatsheet',
    pages: 64,
    fileSize: '3.9 MB',
    author: 'PrepAI Core Engineering Guild',
    upvotes: 754,
    downloads: 2890,
    isVerified: true,
    description: 'TCP 3-way handshake teardowns, congestion control algorithms (CUBIC, BBR), TLS 1.3 handshake packet traces, DNS resolution walkthroughs, and subnetting cheat sheets.'
  },
  {
    id: 'res_05',
    title: 'CMOS VLSI Design: A Circuits and Systems Perspective (Weste & Harris) Formula Compendium',
    category: 'Digital Electronics',
    branch: 'ECE',
    semester: 5,
    subject: 'VLSI Design',
    format: 'Compendium',
    pages: 142,
    fileSize: '9.2 MB',
    author: 'Stanford EE Dept TAs',
    upvotes: 490,
    downloads: 1640,
    isVerified: true,
    description: 'Inverter DC transfer characteristics, propagation delays, logical effort calculations, dynamic logic styles, and clock distribution network skew budgets.'
  },
  {
    id: 'res_06',
    title: 'Digital Signal Processing (Proakis & Manolakis) Z-Transform & FFT Practical Solved Sets',
    category: 'Signal Processing',
    branch: 'ECE',
    semester: 6,
    subject: 'DSP',
    format: 'Notes',
    pages: 120,
    fileSize: '6.7 MB',
    author: 'IIT Kharagpur ECE Faculty',
    upvotes: 380,
    downloads: 1290,
    isVerified: true,
    description: 'Discrete Fourier Transform (DFT), Radix-2 FFT decimation-in-time and frequency butterfly diagrams, IIR/FIR filter design with Bilinear Transformation.'
  }
];

export const mockCodingProblems: CodingProblem[] = [
  {
    id: 'prob_01',
    title: 'Design a High-Throughput Distributed Rate Limiter with Sliding Window Counter',
    difficulty: 'Hard',
    track: "Striver's A2Z",
    step: 'Step 13 / 18: Advanced Concurrency & Systems',
    category: 'Distributed Systems & Concurrency',
    tags: ['Distributed Systems', 'Concurrency', 'Redis Lua', 'Sliding Window'],
    acceptanceRate: '28.4%',
    solved: false,
    description: `Given a continuous stream of client requests identified by their unique clientId, design an in-memory rate limiter that restricts each client to a maximum of **K requests per window of T milliseconds**.

Your solution must use a **Sliding Window Counter** approach to prevent boundary burst attacks where an attacker fires 2K requests right at the boundary of a fixed window.

Implement the class \`SlidingWindowRateLimiter\`:
- \`SlidingWindowRateLimiter(int maxRequests, int windowMs)\`: Initializes the limiter with request capacity and window duration.
- \`bool allowRequest(string clientId, long timestampMs)\`: Returns \`true\` if the request is permitted, or \`false\` if the client has exceeded quota. Expire and prune timestamps older than \`timestampMs - windowMs\`.`,
    constraints: [
      '1 <= maxRequests <= 100,000',
      '1 <= windowMs <= 3,600,000 (up to 1 hour)',
      '1 <= clientId.length <= 64',
      'Timestamps in queries are monotonically non-decreasing per client',
      'At most 500,000 calls to allowRequest will be evaluated'
    ],
    examples: [
      {
        input: 'Limiter(maxRequests=3, windowMs=1000)\nallow("client_1", 100)\nallow("client_1", 200)\nallow("client_1", 300)\nallow("client_1", 400)\nallow("client_1", 1200)',
        output: 'true\ntrue\ntrue\nfalse\ntrue',
        explanation: 'The 4th request at 400ms is rejected because 3 requests occurred within [100..400]. At 1200ms, the request at 100ms has expired, so quota is available.'
      }
    ],
    starterCode: {
      cpp: `#include <iostream>
#include <unordered_map>
#include <deque>
#include <string>

class SlidingWindowRateLimiter {
private:
    int maxRequests;
    long long windowMs;
    std::unordered_map<std::string, std::deque<long long>> clientLogs;

public:
    SlidingWindowRateLimiter(int maxReqs, long long winMs) 
        : maxRequests(maxReqs), windowMs(winMs) {}

    bool allowRequest(const std::string& clientId, long long timestampMs) {
        auto& dq = clientLogs[clientId];
        
        // Evict expired entries outside the sliding window
        while (!dq.empty() && timestampMs - dq.front() >= windowMs) {
            dq.pop_front();
        }

        if (dq.size() < (size_t)maxRequests) {
            dq.push_back(timestampMs);
            return true;
        }

        return false;
    }
};

int main() {
    SlidingWindowRateLimiter limiter(3, 1000);
    std::cout << (limiter.allowRequest("usr_1", 100) ? "PASS" : "FAIL") << "\\n";
    std::cout << (limiter.allowRequest("usr_1", 200) ? "PASS" : "FAIL") << "\\n";
    std::cout << (limiter.allowRequest("usr_1", 300) ? "PASS" : "FAIL") << "\\n";
    std::cout << (limiter.allowRequest("usr_1", 400) ? "PASS" : "FAIL") << "\\n";
    std::cout << (limiter.allowRequest("usr_1", 1200) ? "PASS" : "FAIL") << "\\n";
    return 0;
}`,
      python: `from collections import deque

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_ms: int):
        self.max_requests = max_requests
        self.window_ms = window_ms
        self.client_logs = {}

    def allow_request(self, client_id: str, timestamp_ms: int) -> bool:
        if client_id not in self.client_logs:
            self.client_logs[client_id] = deque()
        
        dq = self.client_logs[client_id]
        
        # Evict timestamps older than window
        while dq and timestamp_ms - dq[0] >= self.window_ms:
            dq.popleft()
            
        if len(dq) < self.max_requests:
            dq.append(timestamp_ms)
            return True
            
        return False

# Test run
if __name__ == "__main__":
    limiter = SlidingWindowRateLimiter(3, 1000)
    print(limiter.allow_request("usr_1", 100))
    print(limiter.allow_request("usr_1", 200))
    print(limiter.allow_request("usr_1", 300))
    print(limiter.allow_request("usr_1", 400))
    print(limiter.allow_request("usr_1", 1200))`,
      go: `package main

import "fmt"

type SlidingWindowRateLimiter struct {
	maxRequests int
	windowMs    int64
	clientLogs  map[string][]int64
}

func NewSlidingWindowRateLimiter(maxReqs int, winMs int64) *SlidingWindowRateLimiter {
	return &SlidingWindowRateLimiter{
		maxRequests: maxReqs,
		windowMs:    winMs,
		clientLogs:  make(map[string][]int64),
	}
}

func (l *SlidingWindowRateLimiter) AllowRequest(clientId string, timestampMs int64) bool {
	logs := l.clientLogs[clientId]
	threshold := timestampMs - l.windowMs
	
	// Filter expired timestamps
	startIdx := 0
	for startIdx < len(logs) && logs[startIdx] <= threshold {
		startIdx++
	}
	logs = logs[startIdx:]
	
	if len(logs) < l.maxRequests {
		logs = append(logs, timestampMs)
		l.clientLogs[clientId] = logs
		return true
	}
	l.clientLogs[clientId] = logs
	return false
}

func main() {
	l := NewSlidingWindowRateLimiter(3, 1000)
	fmt.Println(l.AllowRequest("usr_1", 100))
	fmt.Println(l.AllowRequest("usr_1", 200))
	fmt.Println(l.AllowRequest("usr_1", 300))
	fmt.Println(l.AllowRequest("usr_1", 400))
	fmt.Println(l.AllowRequest("usr_1", 1200))
}`,
      java: `import java.util.*;

public class SlidingWindowRateLimiter {
    private final int maxRequests;
    private final long windowMs;
    private final Map<String, Deque<Long>> clientLogs = new HashMap<>();

    public SlidingWindowRateLimiter(int maxRequests, long windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    public boolean allowRequest(String clientId, long timestampMs) {
        Deque<Long> dq = clientLogs.computeIfAbsent(clientId, k -> new ArrayDeque<>());
        
        while (!dq.isEmpty() && timestampMs - dq.peekFirst() >= windowMs) {
            dq.pollFirst();
        }

        if (dq.size() < maxRequests) {
            dq.addLast(timestampMs);
            return true;
        }

        return false;
    }

    public static void main(String[] args) {
        SlidingWindowRateLimiter limiter = new SlidingWindowRateLimiter(3, 1000);
        System.out.println(limiter.allowRequest("usr_1", 100));
        System.out.println(limiter.allowRequest("usr_1", 200));
        System.out.println(limiter.allowRequest("usr_1", 300));
        System.out.println(limiter.allowRequest("usr_1", 400));
        System.out.println(limiter.allowRequest("usr_1", 1200));
    }
}`
    },
    testCases: [
      {
        input: 'maxRequests=3, windowMs=1000, timestamps=[100, 200, 300, 400, 1200]',
        expectedOutput: '[true, true, true, false, true]'
      },
      {
        input: 'maxRequests=1, windowMs=500, timestamps=[100, 300, 600, 900]',
        expectedOutput: '[true, false, true, false]'
      }
    ]
  }
];

export const mockAdminStats = {
  registeredStudents: 14250,
  dailyActives: 3410,
  peakConcurrent: 840,
  curatedVault: 3130,
  pendingApprovals: 14,
  aiReviewFlags: 6,
  placementRate: '94.8%',
  clusterStatus: 'us-east-1a • 8/8 Online',
  systemLoad: '18.4%',
  latencyRtt: '12ms',
  telemetryPulse: '99.98%',
  pendingResourceRequests: [
    {
      id: 'req_01',
      studentName: 'Ananya Verma',
      rollNumber: '21074012',
      branch: 'ECE',
      title: 'Digital VLSI Static Timing Analysis (STA) Setup & Hold Slack Notes',
      requestedDate: '2 hours ago',
      status: 'Pending Review'
    },
    {
      id: 'req_02',
      studentName: 'Vikram Seth',
      rollNumber: '21075098',
      branch: 'CSE',
      title: 'Linux Kernel 6.x eBPF Observability & XDP Network Driver Guide',
      requestedDate: 'Yesterday',
      status: 'Pending Review'
    },
    {
      id: 'req_03',
      studentName: 'Pooja Iyer',
      rollNumber: '21072044',
      branch: 'EE',
      title: 'Power Electronics Inverter Topology Simulation Handouts',
      requestedDate: '3 days ago',
      status: 'In Review'
    }
  ],
  moderationFlags: [
    {
      id: 'flg_01',
      sessionId: 'int_session_8812',
      candidateName: 'Karthik Rao',
      flagType: 'Speech Cadence Anomaly',
      detail: 'Audio telemetry recorded speech velocity spiking to 280 WPM with rhythmic acoustic resonance (possible TTS script playback).',
      severity: 'Medium',
      timestamp: '14 minutes ago'
    },
    {
      id: 'flg_02',
      sessionId: 'int_session_7904',
      candidateName: 'Aditya Nair',
      flagType: 'Browser Focus Lost',
      detail: 'Browser context switch detected 4 times during Monaco live coding execution (duration: 32s).',
      severity: 'Low',
      timestamp: '1 hour ago'
    }
  ]
};
