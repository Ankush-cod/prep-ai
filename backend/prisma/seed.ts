// prisma/seed.ts
import { BranchCode, Difficulty, PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../src/utils/password';
import { targetCompanies, companyQuestionsData } from './seedData/companiesAndQuestions';
import { striverA2ZProblems } from './seedData/striverA2Z';
import { cp31Problems } from './seedData/cp31';
import { preparationResourcesData } from './seedData/preparationResources';

const prisma = new PrismaClient();

async function main() {
  console.log('[PrepAI Master Seed] Starting idempotent database population...');

  // 1. Seed 4 Engineering Branches
  const branchesData = [
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
  console.log(`[PrepAI Seed] Seeded ${branchesData.length} engineering branches.`);

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
  console.log('[PrepAI Seed] Seeded Semesters 1 through 8.');

  // 3. Seed Default Admin & Student Accounts (idempotent)
  const defaultAdminPassword = await hashPassword('AdminPass123!');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@prepai.edu' },
    update: { role: UserRole.ADMIN, isEmailVerified: true },
    create: {
      email: 'admin@prepai.edu',
      passwordHash: defaultAdminPassword,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      profile: {
        create: {
          fullName: 'System Administrator',
          bio: 'PrepAI Enterprise Academic System Administrator & Lead Platform Architect.',
          targetRoles: ['Systems Architect', 'Lead Evaluator'],
          targetCompanies: ['Google', 'Microsoft', 'Amazon'],
        },
      },
    },
  });

  const defaultStudentPassword = await hashPassword('StudentPass123!');
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@prepai.edu' },
    update: { isEmailVerified: true },
    create: {
      email: 'student@prepai.edu',
      passwordHash: defaultStudentPassword,
      role: UserRole.USER,
      isEmailVerified: true,
      profile: {
        create: {
          fullName: 'Ankush Sharma',
          bio: 'Pre-final year B.Tech student targeting Tier-1 Product Engineering and FinTech placement roles.',
          targetRoles: ['SDE-1', 'Backend Systems Engineer'],
          targetCompanies: ['Google', 'Microsoft', 'Flipkart', 'HSBC'],
          skillsSystems: ['Operating Systems', 'Distributed Systems', 'DBMS'],
          skillsTheory: ['DSA', 'Computer Networks', 'Design Patterns'],
        },
      },
      academicDetails: {
        create: {
          institution: 'Maulana Azad National Institute of Technology (MANIT) Bhopal',
          degree: 'B.Tech',
          rollNumber: '24112011374',
          branchId: branchMap.get(BranchCode.CSE)!,
          semesterId: semesterMap.get(5)!,
          academicYear: 3,
          graduationYear: 2026,
          cgpa: 8.85,
        },
      },
      settings: {
        create: {
          preferredCodingLang: 'cpp',
          preferredInterviewType: 'TECHNICAL',
          defaultDifficulty: 'Medium',
          theme: 'dark',
        },
      },
    },
  });
  console.log(`[PrepAI Seed] Admin (${adminUser.email}) and demo Student (${studentUser.email}) accounts verified.`);

  // 4. Seed Target Companies
  const companyMap = new Map<string, string>();
  for (const c of targetCompanies) {
    const comp = await prisma.company.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        industry: c.industry,
        description: c.description,
      },
      create: c,
    });
    companyMap.set(c.slug, comp.id);
  }
  console.log(`[PrepAI Seed] Seeded ${targetCompanies.length} tier-1 target companies.`);

  // 5. Seed Company Interview Questions
  let companyQuestionsImported = 0;
  for (const q of companyQuestionsData) {
    const companyId = companyMap.get(q.companySlug);
    if (!companyId) continue;

    const existing = await prisma.companyQuestion.findFirst({
      where: {
        companyId,
        title: q.title,
      },
    });

    if (existing) {
      await prisma.companyQuestion.update({
        where: { id: existing.id },
        data: {
          role: q.role,
          questionText: q.questionText,
          topic: q.topic,
          difficulty: q.difficulty,
          tags: q.tags,
          frequency: q.frequency,
          provenance: q.provenance,
          solutionSummary: q.solutionSummary,
          keyConcepts: q.keyConcepts,
          acceptanceRate: q.acceptanceRate,
        },
      });
    } else {
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
          provenance: q.provenance,
          solutionSummary: q.solutionSummary,
          keyConcepts: q.keyConcepts,
          acceptanceRate: q.acceptanceRate,
        },
      });
    }
    companyQuestionsImported++;
  }
  console.log(`[PrepAI Seed] Seeded ${companyQuestionsImported} company interview questions.`);

  // 6. Seed Striver A2Z DSA Sheet Problems
  let striverProblemsImported = 0;
  for (const p of striverA2ZProblems) {
    await prisma.codingProblem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        collection: 'STRIVER_A2Z',
        problemIdentifier: p.problemIdentifier,
        step: p.step,
        topic: p.topic,
        difficulty: p.difficulty,
        externalUrl: p.externalUrl,
        orderIndex: p.orderIndex,
        tags: p.tags,
        description: p.description,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
        testCases: p.testCases,
      },
      create: {
        slug: p.slug,
        title: p.title,
        collection: 'STRIVER_A2Z',
        problemIdentifier: p.problemIdentifier,
        step: p.step,
        topic: p.topic,
        difficulty: p.difficulty,
        externalUrl: p.externalUrl,
        orderIndex: p.orderIndex,
        tags: p.tags,
        description: p.description,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
        testCases: p.testCases,
      },
    });
    striverProblemsImported++;
  }
  console.log(`[PrepAI Seed] Seeded ${striverProblemsImported} Striver A2Z DSA Sheet problems.`);

  // 7. Seed TLE CP-31 Sheet Problems
  let cp31ProblemsImported = 0;
  for (const p of cp31Problems) {
    await prisma.codingProblem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        collection: 'CP_31',
        problemIdentifier: p.problemIdentifier,
        contestNumber: p.contestNumber,
        rating: p.rating,
        topic: p.topic,
        difficulty: p.difficulty,
        externalUrl: p.externalUrl,
        orderIndex: p.orderIndex,
        tags: p.tags,
        description: p.description,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
        testCases: p.testCases,
      },
      create: {
        slug: p.slug,
        title: p.title,
        collection: 'CP_31',
        problemIdentifier: p.problemIdentifier,
        contestNumber: p.contestNumber,
        rating: p.rating,
        topic: p.topic,
        difficulty: p.difficulty,
        externalUrl: p.externalUrl,
        orderIndex: p.orderIndex,
        tags: p.tags,
        description: p.description,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
        testCases: p.testCases,
      },
    });
    cp31ProblemsImported++;
  }
  console.log(`[PrepAI Seed] Seeded ${cp31ProblemsImported} TLE Eliminators CP-31 problems.`);

  // 8. Seed Preparation Resources
  let resourcesImported = 0;
  for (const r of preparationResourcesData) {
    const branchId = branchMap.get(r.branchCode);
    const semesterId = semesterMap.get(r.semesterNumber);
    if (!branchId || !semesterId) continue;

    const existing = await prisma.preparationResource.findFirst({
      where: { branchId, title: r.title },
    });

    if (existing) {
      await prisma.preparationResource.update({
        where: { id: existing.id },
        data: {
          semesterId,
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
    } else {
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
    resourcesImported++;
  }
  console.log(`[PrepAI Seed] Seeded ${resourcesImported} academic preparation resources.`);

  console.log('\n=================== SEED SUMMARY ===================');
  console.log(`✓ Striver A2Z Problems:   ${striverProblemsImported}`);
  console.log(`✓ CP-31 Problems:          ${cp31ProblemsImported}`);
  console.log(`✓ Total Coding Problems:   ${striverProblemsImported + cp31ProblemsImported}`);
  console.log(`✓ Target Companies:        ${targetCompanies.length}`);
  console.log(`✓ Company Questions:       ${companyQuestionsImported}`);
  console.log(`✓ Preparation Resources:   ${resourcesImported}`);
  console.log('====================================================\n');
}

main()
  .catch((err) => {
    console.error('[PrepAI Seed] Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
