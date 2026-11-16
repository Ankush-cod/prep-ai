// tests/e2e-interview-audit.ts
import { prisma } from '../src/config/database';
import { interviewService } from '../src/services/interview.service';
import { recommendationService } from '../src/services/recommendation.service';
import { reportService } from '../src/services/report.service';

async function runAudit() {
  console.log('[Audit] Starting end-to-end verification for Rahul Sharma (CSE)...');

  const branch = await prisma.branch.findFirst({ where: { code: 'CSE' } });
  const semester = await prisma.semester.findFirst({ where: { number: 5 } });

  let user = await prisma.user.findFirst({
    where: { email: 'rahul.sharma@manit.ac.in' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'rahul.sharma@manit.ac.in',
        passwordHash: '$2b$10$e845f123456789012345678901234567890123456789012345678',
        isEmailVerified: true,
        profile: {
          create: {
            fullName: 'Rahul Sharma',
            phone: '9876543210',
          },
        },
        academicDetails: {
          create: {
            institution: 'MANIT Bhopal',
            degree: 'B.Tech',
            rollNumber: '211112001',
            branchId: branch!.id,
            semesterId: semester!.id,
            cgpa: 8.75,
            academicYear: 3,
          },
        },
      },
    });
    console.log('[Audit] Created test user Rahul Sharma:', user.id);
  } else {
    console.log('[Audit] Using existing user Rahul Sharma:', user.id);
  }

  const userId = user.id;

  // 2. Test Session Creation with COMPREHENSIVE mode
  console.log('\n--- Step 1: Create Interview Session (COMPREHENSIVE Mode) ---');
  const session = await prisma.interviewSession.create({
    data: {
      userId,
      branchId: branch?.id || null,
      semesterId: semester?.id || null,
      title: 'Google — Comprehensive Placement Interview (CSE)',
      companyName: 'Google',
      interviewType: 'TECHNICAL',
      difficulty: 'Medium',
      topic: 'Data Structures & Algorithms',
      questionCount: 3,
      durationMinutes: 45,
      status: 'IN_PROGRESS',
      mode: 'COMPREHENSIVE',
      questions: {
        create: [
          {
            orderIndex: 1,
            prompt: 'Design an LRU Cache with O(1) get and put operations. Explain internal invariants and thread safety.',
            topic: 'Data Structures & Algorithms',
            expectedConcepts: ['Doubly Linked List', 'Hash Map', 'Eviction Invariant', 'Mutex / Read-Write Lock'],
            isFollowUp: false,
          },
          {
            orderIndex: 2,
            prompt: 'Explain database indexing using B+ Trees vs Hash Indexes, and describe write amplification tradeoffs.',
            topic: 'DBMS & Indexing',
            expectedConcepts: ['B+ Tree Fanout', 'Range Query Invariant', 'Write Amplification', 'WAL'],
            isFollowUp: false,
          },
          {
            orderIndex: 3,
            prompt: 'How would you scale a web service to handle 100k concurrent WebSocket connections?',
            topic: 'System Design & Architecture',
            expectedConcepts: ['Event Loop / Epoll', 'Load Balancers', 'Redis Pub/Sub', 'File Descriptor Limits'],
            isFollowUp: false,
          },
        ],
      },
    },
    include: {
      questions: { orderBy: { orderIndex: 'asc' } },
    },
  });

  console.log(`[Audit] Created Session ID: ${session.id} with ${session.questions.length} questions.`);

  // 3. Test Submitting Answer for Q1
  console.log('\n--- Step 2: Submit Answer for Question 1 ---');
  const q1 = session.questions[0];
  const ans1 = await interviewService.submitAnswer(
    session.id,
    userId,
    q1.id,
    'I use a hash map paired with a doubly linked list. Get operation looks up the node in the map in O(1) time and moves it to the head. Put operation inserts or updates the node; if capacity is exceeded, the tail node is evicted from both list and map.'
  );
  console.log(`[Audit] Q1 Evaluated: Score ${ans1.evaluation.overallQuestionScore}% | Technical: ${ans1.evaluation.technicalScore}%`);
  console.log(`[Audit] Strengths: ${ans1.evaluation.strengths.join(', ')}`);
  console.log(`[Audit] Missing Concepts: ${ans1.evaluation.missingConcepts.join(', ')}`);

  // 4. Test Editing/Updating Answer for Q1 (verifies no "already submitted" rejection!)
  console.log('\n--- Step 3: Update Answer for Question 1 (Answer Editing Test) ---');
  const ans1Updated = await interviewService.submitAnswer(
    session.id,
    userId,
    q1.id,
    'Refined Answer: I implement the LRU Cache using an std::unordered_map<int, std::list<std::pair<int, int>>::iterator> and an std::list. The get() operation takes O(1) time and moves the accessed element to the front using splice(). The put() operation checks key existence; if absent and size exceeds capacity, the back() element is evicted. For thread safety, I would wrap operations in a std::shared_mutex allowing concurrent reads with shared_lock and exclusive unique_lock for writes.'
  );
  console.log(`[Audit] Q1 Re-evaluated after edit: Score ${ans1Updated.evaluation.overallQuestionScore}% (Verified: Edit succeeded cleanly without error)`);

  // 5. Submit Answers for remaining questions
  console.log('\n--- Step 4: Submit Answers for Q2 and Q3 ---');
  const q2 = session.questions[1];
  await interviewService.submitAnswer(
    session.id,
    userId,
    q2.id,
    'B+ trees keep data sorted in leaf nodes connected via pointers, which makes range queries O(log N + K). Hash indexes only allow point lookups in O(1). However, B+ trees suffer from write amplification due to random page splits, whereas LSM trees append to memtables.'
  );

  const q3 = session.questions[2];
  await interviewService.submitAnswer(
    session.id,
    userId,
    q3.id,
    'To support 100k concurrent WebSockets, we tune kernel sysctl limits for open file descriptors (nofile), use an epoll-based async non-blocking runtime like Node.js or Go epoll server, deploy multiple instances behind an Layer 4 / Layer 7 load balancer with IP hashing, and maintain broadcast state using Redis Pub/Sub.'
  );

  // 6. Complete Session
  console.log('\n--- Step 5: Complete Interview Session & Generate Synthesis ---');
  const completedSession = await interviewService.completeSession(session.id, userId);
  console.log(`[Audit] Session Status: ${completedSession.status}`);
  console.log(`[Audit] Overall Score: ${completedSession.overallScore}%`);
  console.log(`[Audit] Six Dimensions: Tech=${completedSession.technicalScore}%, Concept=${completedSession.conceptualScore}%, Clarity=${completedSession.clarityScore}%, Comm=${completedSession.communicationScore}%, Complete=${completedSession.completenessScore}%, ProblemSolving=${completedSession.problemSolvingScore}%`);
  console.log(`[Audit] Feedback Category Scores:`, completedSession.feedback?.categoryScores);

  // 7. Verify Recommendations Service
  console.log('\n--- Step 6: Test Personalized Recommendations Service ---');
  const recs = await recommendationService.getSessionRecommendations(session.id, userId);
  console.log(`[Audit] Generated ${recs.length} Personalized Recommendations:`);
  recs.slice(0, 3).forEach((r, idx) => {
    console.log(`  [${idx + 1}] Topic: "${r.topic}" | Priority: ${r.priority} | Est: ${r.estimatedHours}h`);
    console.log(`      Reason: ${r.reason}`);
    console.log(`      Linked Resources: ${r.resources.map((x) => x.title).join(', ') || 'None'}`);
    console.log(`      Linked Problems: ${r.practiceProblems.map((x) => x.title).join(', ') || 'None'}`);
  });

  // 8. Test Study Notes Generation
  console.log('\n--- Step 7: Test Study Notes Synthesis ---');
  const notes = await reportService.generateStudyNotes(session.id, userId, true);
  console.log(`[Audit] Study Notes Title: "${notes.title}"`);
  console.log(`[Audit] Key Definitions Count: ${notes.keyDefinitions?.length ?? 0}`);
  console.log(`[Audit] Core Concepts Count: ${notes.coreConcepts?.length ?? 0}`);
  console.log(`[Audit] Algorithms & Patterns Count: ${notes.algorithmsAndPatterns?.length ?? 0}`);
  console.log(`[Audit] Revision Checklist Items: ${notes.revisionChecklist?.length ?? 0}`);

  // 9. Test PDF Generation (both Session Report and Study Notes PDF)
  console.log('\n--- Step 8: Test PDF Compilers ---');
  const reportPdf = await reportService.generateInterviewPdf(session.id, userId);
  console.log(`[Audit] Generated Interview Report PDF: ${reportPdf.length} bytes`);

  const notesPdf = await reportService.generateStudyNotesPdf(session.id, userId);
  console.log(`[Audit] Generated Study Notes Dossier PDF: ${notesPdf.length} bytes`);

  console.log('\n✅ ALL AUDIT STEPS COMPLETED WITH 100% SUCCESS!');
  process.exit(0);
}

runAudit().catch((err) => {
  console.error('❌ Audit encountered an error:', err);
  process.exit(1);
});
