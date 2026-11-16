// src/pages/AdminDashboard.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Check,
  Search,
  AlertCircle,
  RefreshCw,
  Trash2,
  PlusCircle,
  ShieldCheck,
  Terminal,
  Code2,
  Video,
  ExternalLink,
  Users,
  FolderArchive,
  HelpCircle,
  Inbox,
  Filter,
  Layers,
  Edit2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import {
  AdminAiReviewFlagItem,
  AdminCodingProblemItem,
  AdminInterviewSessionItem,
  AdminOverviewResponse,
  AdminResourceRequestItem,
  AdminUserItem,
  adminService,
} from '../services/adminService';
import {
  BackendCompanyQuestion,
  BackendResource,
  resourceService,
} from '../services/resourceService';
import { Branch } from '../types/prepai';

type AdminSection =
  | 'overview'
  | 'users'
  | 'resources'
  | 'coding-problems'
  | 'interviews'
  | 'question-bank'
  | 'requests'
  | 'ai-review'
  | 'analytics'
  | 'settings';

function resolveSection(pathname: string): AdminSection {
  if (pathname.startsWith('/admin/users')) return 'users';
  if (pathname.startsWith('/admin/resources')) return 'resources';
  if (pathname.startsWith('/admin/coding-problems')) return 'coding-problems';
  if (pathname.startsWith('/admin/interviews')) return 'interviews';
  if (pathname.startsWith('/admin/question-bank')) return 'question-bank';
  if (pathname.startsWith('/admin/requests')) return 'requests';
  if (pathname.startsWith('/admin/ai-review')) return 'ai-review';
  if (pathname.startsWith('/admin/analytics')) return 'analytics';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  return 'overview';
}

export const AdminDashboard: React.FC = () => {
  const { showToast } = useApp();
  const location = useLocation();
  const section = resolveSection(location.pathname);

  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [requests, setRequests] = useState<AdminResourceRequestItem[]>([]);
  const [flags, setFlags] = useState<AdminAiReviewFlagItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [resources, setResources] = useState<BackendResource[]>([]);
  const [codingProblems, setCodingProblems] = useState<AdminCodingProblemItem[]>([]);
  const [interviews, setInterviews] = useState<AdminInterviewSessionItem[]>([]);
  const [questions, setQuestions] = useState<BackendCompanyQuestion[]>([]);
  const [platformAnalytics, setPlatformAnalytics] = useState<Awaited<
    ReturnType<typeof adminService.getPlatformAnalytics>
  > | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add resource modal/form
  const [resTitle, setResTitle] = useState('');
  const [resBranch, setResBranch] = useState<Branch>('CSE');
  const [resSemester, setResSemester] = useState<number>(3);
  const [resSubject, setResSubject] = useState('');
  const [resTopic, setResTopic] = useState('');
  const [resFormat, setResFormat] = useState<string>('NOTES');
  const [resDifficulty, setResDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resIsPyq, setResIsPyq] = useState(false);

  // Coding problem modal/form
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [probTitle, setProbTitle] = useState('');
  const [probSlug, setProbSlug] = useState('');
  const [probDifficulty, setProbDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [probTopic, setProbTopic] = useState('Arrays');
  const [probRating, setProbRating] = useState<number>(800);
  const [probDescription, setProbDescription] = useState('');
  const [probExternalUrl, setProbExternalUrl] = useState('');
  const [probInputFormat, setProbInputFormat] = useState('');
  const [probOutputFormat, setProbOutputFormat] = useState('');
  const [probConstraints, setProbConstraints] = useState('');

  // Add company question form state
  const [cqCompany, setCqCompany] = useState('Google');
  const [cqRole, setCqRole] = useState('Software Engineer');
  const [cqTitle, setCqTitle] = useState('');
  const [cqQuestionText, setCqQuestionText] = useState('');
  const [cqTopic, setCqTopic] = useState('Algorithms');
  const [cqDifficulty, setCqDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [cqSolution, setCqSolution] = useState('');

  // Request action modal
  const [actionReqModal, setActionReqModal] = useState<{ id: string; status: 'APPROVED' | 'REJECTED' } | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const loadSectionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const overviewPromise = adminService.getOverview();
      if (section === 'overview' || section === 'settings') {
        const [ov, reqList, flagList] = await Promise.all([
          overviewPromise,
          adminService.listResourceRequests(),
          adminService.listAiReviews(),
        ]);
        setOverview(ov);
        setRequests(reqList);
        setFlags(flagList);
      } else if (section === 'users') {
        const [ov, userList] = await Promise.all([
          overviewPromise,
          adminService.listUsers(userSearch.trim() || undefined),
        ]);
        setOverview(ov);
        setUsers(userList);
      } else if (section === 'resources') {
        const [ov, resList] = await Promise.all([
          overviewPromise,
          resourceService.listResources(),
        ]);
        setOverview(ov);
        setResources(resList);
      } else if (section === 'coding-problems') {
        const [ov, pList] = await Promise.all([
          overviewPromise,
          adminService.listCodingProblems(),
        ]);
        setOverview(ov);
        setCodingProblems(pList);
      } else if (section === 'interviews') {
        const [ov, intList] = await Promise.all([
          overviewPromise,
          adminService.listInterviews(),
        ]);
        setOverview(ov);
        setInterviews(intList);
      } else if (section === 'question-bank') {
        const [ov, qList] = await Promise.all([
          overviewPromise,
          resourceService.listCompanyQuestions(),
        ]);
        setOverview(ov);
        setQuestions(qList);
      } else if (section === 'requests') {
        const [ov, reqList] = await Promise.all([
          overviewPromise,
          adminService.listResourceRequests(),
        ]);
        setOverview(ov);
        setRequests(reqList);
      } else if (section === 'ai-review') {
        const [ov, flagList] = await Promise.all([
          overviewPromise,
          adminService.listAiReviews(),
        ]);
        setOverview(ov);
        setFlags(flagList);
      } else if (section === 'analytics') {
        const [ov, plat] = await Promise.all([
          overviewPromise,
          adminService.getPlatformAnalytics(),
        ]);
        setOverview(ov);
        setPlatformAnalytics(plat);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Failed to load admin management console.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [section, userSearch]);

  useEffect(() => {
    void loadSectionData();
  }, [loadSectionData]);

  // Request actions
  const handleConfirmRequestAction = async () => {
    if (!actionReqModal) return;
    try {
      await adminService.updateResourceRequest(actionReqModal.id, actionReqModal.status, adminNote.trim() || undefined);
      setRequests((prev) =>
        prev.map((r) => (r.id === actionReqModal.id ? { ...r, status: actionReqModal.status, adminNote } : r))
      );
      showToast(`Resource request marked ${actionReqModal.status}`);
      setActionReqModal(null);
      setAdminNote('');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update request', 'warning');
    }
  };

  const handleFlagAction = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await adminService.resolveAiReview(id, status);
      setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
      showToast(`Flag marked ${status}`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update flag', 'warning');
    }
  };

  const handleToggleUserStatus = async (u: AdminUserItem) => {
    try {
      await adminService.updateUser(u.id, { isActive: !u.isActive });
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, isActive: !item.isActive } : item))
      );
      showToast(`User ${u.email} ${!u.isActive ? 'activated' : 'suspended'}`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update user', 'warning');
    }
  };

  const handleToggleUserRole = async (u: AdminUserItem) => {
    const nextRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await adminService.updateUser(u.id, { role: nextRole });
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, role: nextRole } : item))
      );
      showToast(`Updated role for ${u.email} to ${nextRole}`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to update user role', 'warning');
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await resourceService.createResource({
        branch: resBranch,
        semester: resSemester,
        title: resTitle.trim(),
        subject: resSubject.trim(),
        topic: resTopic.trim() || resSubject.trim(),
        format: resFormat,
        difficulty: resDifficulty,
        description: resDesc.trim(),
        contentUrl: resUrl.trim() || undefined,
        isGatePyq: resIsPyq || resFormat === 'GATE_PYQS',
        isVerified: true,
      });
      setResources((prev) => [res.resource, ...prev]);
      setResTitle('');
      setResSubject('');
      setResTopic('');
      setResDesc('');
      setResUrl('');
      showToast('Resource published to curriculum library');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to create resource', 'warning');
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourceService.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast('Resource removed');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete resource', 'warning');
    }
  };

  const handleCreateCodingProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slugVal = probSlug.trim() || probTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const created = await adminService.createCodingProblem({
        title: probTitle.trim(),
        slug: slugVal,
        difficulty: probDifficulty,
        topic: probTopic.trim(),
        tags: [probTopic.trim(), probDifficulty.toLowerCase()],
        rating: probRating,
        description: probDescription.trim() || probTitle.trim(),
        inputFormat: probInputFormat.trim() || undefined,
        outputFormat: probOutputFormat.trim() || undefined,
        constraints: probConstraints.trim() || undefined,
        externalUrl: probExternalUrl.trim() || undefined,
        testCases: [
          { input: '5\n1 2 3 4 5', expectedOutput: '15', isHidden: false },
          { input: '3\n10 20 30', expectedOutput: '60', isHidden: true },
        ],
      });
      setCodingProblems((prev) => [created, ...prev]);
      setProblemModalOpen(false);
      setProbTitle('');
      setProbSlug('');
      setProbDescription('');
      setProbExternalUrl('');
      showToast('Coding problem published successfully');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to create coding problem', 'warning');
    }
  };

  const handleDeleteCodingProblem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coding problem?')) return;
    try {
      await adminService.deleteCodingProblem(id);
      setCodingProblems((prev) => prev.filter((p) => p.id !== id));
      showToast('Coding problem deleted');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete problem', 'warning');
    }
  };

  const handleCreateCompanyQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await resourceService.createCompanyQuestion({
        companyName: cqCompany.trim(),
        role: cqRole.trim(),
        title: cqTitle.trim(),
        questionText: cqQuestionText.trim(),
        topic: cqTopic.trim(),
        difficulty: cqDifficulty,
        solutionSummary: cqSolution.trim(),
        tags: [cqTopic.trim()],
        keyConcepts: [cqTopic.trim()],
      });
      setQuestions((prev) => [res.question, ...prev]);
      setCqTitle('');
      setCqQuestionText('');
      setCqSolution('');
      showToast('Company question added');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to add question', 'warning');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await resourceService.deleteCompanyQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showToast('Question deleted');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete question', 'warning');
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm" />
        <div className="h-64 rounded-2xl bg-white border border-[#E2E4EB] shadow-sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>Admin Console Error</span>
          </div>
          <p className="text-xs text-[#77788B]">{error}</p>
          <button
            onClick={loadSectionData}
            className="px-4 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const m = overview?.metrics;
  const pendingReqCount = requests.filter((r) => r.status === 'PENDING').length;
  const openFlagCount = flags.filter((f) => f.status === 'OPEN').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. HEADER SECTION & TELEMETRY ROW */}
      <section className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77788B]">
              <span className="px-2 py-0.5 rounded-md bg-[#EEF2FF] text-[#5145E5] font-mono font-medium">
                ADMIN_OPS // {section.toUpperCase().replace('-', '_')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17182B]">
              PrepAI Master Administration Console
            </h1>
            <p className="text-sm text-[#77788B] max-w-3xl leading-relaxed">
              Platform governance, student user moderation, 4-discipline curriculum courseware, Striver A2Z and CP-31 coding problem sets, interview transcripts, and resource request approvals.
            </p>
          </div>

          <button
            onClick={loadSectionData}
            className="px-4 py-2.5 rounded-xl bg-[#F4F4FA] hover:bg-[#EAEAF4] border border-[#E2E4EB] text-xs font-semibold text-[#17182B] flex items-center gap-2 self-start lg:self-auto cursor-pointer transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#5145E5]" />
            <span>Sync Live DB</span>
          </button>
        </div>

        {/* 6 Real Stat Cards */}
        {m && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block">
                Total Users
              </span>
              <div className="text-2xl font-bold text-[#17182B] mt-0.5 font-mono">
                {m.totalUsers}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                {m.activeUsers} Active
              </span>
            </div>

            <div className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block">
                Mock Sessions
              </span>
              <div className="text-2xl font-bold text-[#17182B] mt-0.5 font-mono">
                {m.totalSessions}
              </div>
              <span className="text-[11px] text-[#5145E5] font-medium">
                {m.completedSessions} Completed
              </span>
            </div>

            <div className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block">
                Study Materials
              </span>
              <div className="text-2xl font-bold text-[#17182B] mt-0.5 font-mono">
                {m.totalResources}
              </div>
              <span className="text-[11px] text-[#77788B] font-medium">
                4 Branches Active
              </span>
            </div>

            <div className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block">
                Coding Problems
              </span>
              <div className="text-2xl font-bold text-[#5145E5] mt-0.5 font-mono">
                {m.totalCodingProblems}
              </div>
              <span className="text-[11px] text-[#77788B] font-medium">
                Striver + CP-31
              </span>
            </div>

            <div className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block">
                Pending Requests
              </span>
              <div className="text-2xl font-bold text-amber-600 mt-0.5 font-mono">
                {m.pendingResourceRequests}
              </div>
              <span className="text-[11px] text-[#77788B] font-medium">
                Student Queue
              </span>
            </div>

            <div className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block">
                AI Review Flags
              </span>
              <div className="text-2xl font-bold text-rose-600 mt-0.5 font-mono">
                {m.openReviewFlags}
              </div>
              <span className="text-[11px] text-[#77788B] font-medium">
                Needs Attention
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 2. SECTION: OVERVIEW */}
      {section === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#17182B]">
                  Pending Resource Requests ({pendingReqCount})
                </h2>
                <p className="text-xs text-[#77788B]">
                  Student courseware requests waiting for administrative review
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono text-xs font-bold border border-amber-200">
                {pendingReqCount} Pending
              </span>
            </div>

            {requests.length === 0 ? (
              <p className="p-6 text-center text-xs text-[#77788B]">
                No pending resource requests. All submissions moderated.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#5145E5] font-mono text-[10px] font-bold">
                          {req.branch.code}
                        </span>
                        <span className="text-[#77788B] font-mono text-[11px]">
                          {req.user.profile?.fullName || req.user.email}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white text-[#77788B] font-mono text-[10px] border border-[#E2E4EB]">
                          {req.status}
                        </span>
                      </div>
                      <h4 className="font-semibold text-[#17182B]">{req.title}</h4>
                      <p className="text-[#77788B] text-[11px] mt-0.5">
                        {req.subject}
                        {req.notes ? ` — ${req.notes}` : ''}
                      </p>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setActionReqModal({ id: req.id, status: 'APPROVED' })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => setActionReqModal({ id: req.id, status: 'REJECTED' })}
                          className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                          title="Reject Request"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#17182B]">AI Evaluation Flags</h2>
                <p className="text-xs text-[#77788B]">Candidate-reported evaluation feedback</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-xs font-bold border border-rose-200">
                {openFlagCount} Open
              </span>
            </div>

            {flags.length === 0 ? (
              <p className="p-6 text-center text-xs text-[#77788B]">
                No active evaluation review flags recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {flags.slice(0, 4).map((flg) => (
                  <div
                    key={flg.id}
                    className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200">
                        {flg.status}
                      </span>
                      <span className="text-[10px] text-[#77788B] font-mono">
                        {new Date(flg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-semibold text-[#17182B]">{flg.session.title}</div>
                    <p className="text-[#77788B] text-[11px]">{flg.reason}</p>
                    {flg.status === 'OPEN' && (
                      <div className="flex justify-end gap-2 pt-1 border-t border-[#E2E4EB]">
                        <button
                          onClick={() => void handleFlagAction(flg.id, 'RESOLVED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold cursor-pointer"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => void handleFlagAction(flg.id, 'DISMISSED')}
                          className="px-2.5 py-1 rounded-lg bg-white text-[#77788B] border border-[#E2E4EB] text-[11px] cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SECTION: USERS */}
      {section === 'users' && (
        <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E4EB] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#17182B]">Platform User Accounts</h2>
              <p className="text-xs text-[#77788B]">Manage permissions, student status, and academic disciplines</p>
            </div>
            <div className="flex items-center gap-2 bg-[#F7F7FC] px-3.5 py-2 rounded-xl border border-[#E2E4EB] focus-within:border-[#5145E5] focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-[#77788B]" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search email, name..."
                className="bg-transparent text-xs text-[#17182B] placeholder-[#77788B] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-semibold uppercase tracking-wider text-[#77788B] border-b border-[#E2E4EB]">
                <tr>
                  <th className="py-2.5 pr-4">User</th>
                  <th className="py-2.5 pr-4">Academic Details</th>
                  <th className="py-2.5 pr-4">Activity Counts</th>
                  <th className="py-2.5 pr-4">Platform Role</th>
                  <th className="py-2.5 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E4EB]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F7F7FC]">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-[#17182B]">
                        {u.profile?.fullName || 'Unnamed Student'}
                      </div>
                      <div className="text-[11px] font-mono text-[#77788B]">{u.email}</div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-[#17182B]">
                      {u.academicDetails
                        ? `${u.academicDetails.branch.code} • Semester ${u.academicDetails.semester.number}`
                        : '—'}
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-[#77788B]">
                      {u._count.interviewSessions} mocks • {u._count.codingSubmissions} submissions
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => void handleToggleUserRole(u)}
                        className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#5145E5] font-mono text-[10px] font-bold border border-[#E0E7FF] cursor-pointer"
                        title="Click to toggle Role"
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => void handleToggleUserStatus(u)}
                        className={`px-3 py-1 rounded-lg font-mono text-[11px] font-semibold cursor-pointer border ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {u.isActive ? 'Active (Suspend)' : 'Suspended (Activate)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SECTION: RESOURCE MANAGEMENT */}
      {section === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateResource}
            className="lg:col-span-5 bg-white border border-[#E2E4EB] rounded-2xl p-6 space-y-3.5 text-xs shadow-sm"
          >
            <div className="flex items-center gap-2 font-bold text-[#17182B] text-sm pb-2 border-b border-[#E2E4EB]">
              <PlusCircle className="w-4 h-4 text-[#5145E5]" />
              <span>Add Engineering Courseware</span>
            </div>
            <div>
              <label className="text-[#17182B] font-semibold block mb-1">Title *</label>
              <input
                required
                placeholder="e.g., Operating Systems Complete Semaphore Notes"
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B] focus:outline-none focus:border-[#5145E5]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[#17182B] font-semibold block mb-1">Discipline</label>
                <select
                  value={resBranch}
                  onChange={(e) => setResBranch(e.target.value as Branch)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-2 py-2 text-[#17182B] focus:outline-none"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="EE">EE</option>
                  <option value="ME">ME</option>
                </select>
              </div>
              <div>
                <label className="text-[#17182B] font-semibold block mb-1">Semester</label>
                <select
                  value={resSemester}
                  onChange={(e) => setResSemester(Number(e.target.value))}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-2 py-2 text-[#17182B] focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[#17182B] font-semibold block mb-1">Difficulty</label>
                <select
                  value={resDifficulty}
                  onChange={(e) => setResDifficulty(e.target.value as any)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-2 py-2 text-[#17182B] focus:outline-none"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#17182B] font-semibold block mb-1">Subject *</label>
                <input
                  required
                  placeholder="e.g., Operating Systems"
                  value={resSubject}
                  onChange={(e) => setResSubject(e.target.value)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#17182B] font-semibold block mb-1">Format</label>
                <select
                  value={resFormat}
                  onChange={(e) => setResFormat(e.target.value)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-2 py-2 text-[#17182B] focus:outline-none"
                >
                  <option value="NOTES">NOTES</option>
                  <option value="PDF">PDF</option>
                  <option value="COMPENDIUM">COMPENDIUM</option>
                  <option value="CHEATSHEET">CHEATSHEET</option>
                  <option value="GATE_PYQS">GATE_PYQS</option>
                  <option value="CONCEPT">CONCEPT</option>
                  <option value="INTERVIEW_QA">INTERVIEW_QA</option>
                  <option value="MCQ">MCQ</option>
                  <option value="TUTORIAL">TUTORIAL</option>
                  <option value="FORMULAS">FORMULAS</option>
                  <option value="REVISION">REVISION</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#17182B] font-semibold block mb-1">Topic</label>
              <input
                placeholder="e.g., Concurrency & Deadlocks"
                value={resTopic}
                onChange={(e) => setResTopic(e.target.value)}
                className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#17182B] font-semibold block mb-1">Description *</label>
              <textarea
                required
                rows={2}
                placeholder="Brief summary of syllabus coverage..."
                value={resDesc}
                onChange={(e) => setResDesc(e.target.value)}
                className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-2.5 text-[#17182B] focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-[#17182B] cursor-pointer">
              <input
                type="checkbox"
                checked={resIsPyq}
                onChange={(e) => setResIsPyq(e.target.checked)}
                className="rounded text-[#5145E5] focus:ring-[#5145E5]"
              />
              <span className="font-medium">Mark as branch GATE PYQ archive</span>
            </label>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold cursor-pointer shadow-sm transition-all"
            >
              Publish Resource to Library
            </button>
          </form>

          <div className="lg:col-span-7 bg-white border border-[#E2E4EB] rounded-2xl p-6 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-[#17182B] pb-2 border-b border-[#E2E4EB]">
              Curriculum Library Resources ({resources.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex items-center justify-between text-xs gap-2"
                >
                  <div>
                    <div className="font-semibold text-[#17182B]">{r.title}</div>
                    <div className="text-[11px] font-mono text-[#77788B]">
                      {r.branch.code} • Sem {r.semester.number} • {r.format} • {r.difficulty || 'EASY'}
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDeleteResource(r.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SECTION: CODING PROBLEMS MANAGEMENT */}
      {section === 'coding-problems' && (
        <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E4EB] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#17182B]">
                Coding Practice Problems ({codingProblems.length})
              </h2>
              <p className="text-xs text-[#77788B]">
                Manage Striver A2Z DSA sheet and TLE Eliminators CP-31 problem sets
              </p>
            </div>
            <button
              onClick={() => setProblemModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Problem</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-semibold uppercase tracking-wider text-[#77788B] border-b border-[#E2E4EB]">
                <tr>
                  <th className="py-2.5 pr-4">Problem</th>
                  <th className="py-2.5 pr-4">Difficulty & Topic</th>
                  <th className="py-2.5 pr-4">Rating / Contest</th>
                  <th className="py-2.5 pr-4">Test Cases</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E4EB]">
                {codingProblems.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F7FC]">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-[#17182B]">{p.title}</div>
                      <div className="text-[11px] font-mono text-[#77788B]">{p.slug}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#5145E5] font-mono text-[10px] font-bold mr-1.5">
                        {p.difficulty}
                      </span>
                      <span className="font-medium text-[#17182B]">{p.topic}</span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-[#77788B]">
                      {p.rating ? `Rating ${p.rating}` : 'Striver A2Z'}
                      {p.contestNumber ? ` • Div ${p.contestNumber}` : ''}
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-[#77788B]">
                      {p.testCases ? `${p.testCases.length} Cases` : 'Standard'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => void handleDeleteCodingProblem(p.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                        title="Delete Problem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SECTION: INTERVIEW SESSIONS MANAGEMENT */}
      {section === 'interviews' && (
        <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-[#E2E4EB] pb-3">
            <h2 className="text-sm font-bold text-[#17182B]">Real Interview Sessions ({interviews.length})</h2>
            <p className="text-xs text-[#77788B]">Live candidate mock interviews and AI evaluation rubrics</p>
          </div>

          {interviews.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#77788B]">No interview sessions registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-semibold uppercase tracking-wider text-[#77788B] border-b border-[#E2E4EB]">
                  <tr>
                    <th className="py-2.5 pr-4">Candidate</th>
                    <th className="py-2.5 pr-4">Interview Title & Type</th>
                    <th className="py-2.5 pr-4">Status</th>
                    <th className="py-2.5 pr-4">Score</th>
                    <th className="py-2.5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E4EB]">
                  {interviews.map((iv) => (
                    <tr key={iv.id} className="hover:bg-[#F7F7FC]">
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-[#17182B]">
                          {iv.user.profile?.fullName || 'Candidate'}
                        </div>
                        <div className="text-[11px] font-mono text-[#77788B]">{iv.user.email}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-[#17182B]">{iv.title}</div>
                        <span className="px-2 py-0.5 rounded bg-[#F4F4FA] text-[#77788B] font-mono text-[10px]">
                          {iv.interviewType}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                          {iv.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono font-bold text-sm text-[#5145E5]">
                        {iv.overallScore !== null && iv.overallScore !== undefined ? `${iv.overallScore}%` : '—'}
                      </td>
                      <td className="py-3 text-right font-mono text-[11px] text-[#77788B]">
                        {new Date(iv.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. SECTION: QUESTION BANK */}
      {section === 'question-bank' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateCompanyQuestion}
            className="lg:col-span-5 bg-white border border-[#E2E4EB] rounded-2xl p-6 space-y-3 text-xs shadow-sm"
          >
            <div className="flex items-center gap-2 font-bold text-[#17182B] text-sm pb-2 border-b border-[#E2E4EB]">
              <PlusCircle className="w-4 h-4 text-[#5145E5]" />
              <span>Add Company Question</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="Company (e.g., Google) *"
                value={cqCompany}
                onChange={(e) => setCqCompany(e.target.value)}
                className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B]"
              />
              <input
                required
                placeholder="Role (e.g., Software Eng) *"
                value={cqRole}
                onChange={(e) => setCqRole(e.target.value)}
                className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B]"
              />
            </div>
            <input
              required
              placeholder="Question Title *"
              value={cqTitle}
              onChange={(e) => setCqTitle(e.target.value)}
              className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="Topic *"
                value={cqTopic}
                onChange={(e) => setCqTopic(e.target.value)}
                className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B]"
              />
              <select
                value={cqDifficulty}
                onChange={(e) => setCqDifficulty(e.target.value as any)}
                className="bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B]"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <textarea
              required
              rows={2}
              placeholder="Question text prompt *"
              value={cqQuestionText}
              onChange={(e) => setCqQuestionText(e.target.value)}
              className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-2.5 text-[#17182B]"
            />
            <textarea
              required
              rows={2}
              placeholder="Solution summary *"
              value={cqSolution}
              onChange={(e) => setCqSolution(e.target.value)}
              className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-2.5 text-[#17182B]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold cursor-pointer shadow-sm transition-all"
            >
              Add to Question Bank
            </button>
          </form>

          <div className="lg:col-span-7 bg-white border border-[#E2E4EB] rounded-2xl p-6 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-[#17182B] pb-2 border-b border-[#E2E4EB]">
              Company Questions ({questions.length})
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex items-center justify-between text-xs gap-2"
                >
                  <div>
                    <div className="font-semibold text-[#17182B]">{q.title}</div>
                    <div className="text-[11px] font-mono text-[#77788B]">
                      {q.company.name} • {q.topic} • {q.difficulty}
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. SECTION: REQUESTS */}
      {section === 'requests' && (
        <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-[#E2E4EB] pb-3">
            <h2 className="text-sm font-bold text-[#17182B]">
              All Student Resource Requests ({requests.length})
            </h2>
            <p className="text-xs text-[#77788B]">Approve or reject candidate submissions with feedback notes</p>
          </div>
          {requests.length === 0 ? (
            <p className="text-xs text-[#77788B] py-6 text-center">
              No resource requests found.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-[#EEF2FF] text-[#5145E5] font-bold">
                        {req.branch.code}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white text-[#77788B] border border-[#E2E4EB]">
                        {req.status}
                      </span>
                      <span className="text-[#77788B]">{req.user.email}</span>
                    </div>
                    <div className="font-semibold text-[#17182B] mt-1 text-sm">{req.title}</div>
                    <p className="text-[#77788B] text-xs mt-0.5">Subject: {req.subject}</p>
                    {req.notes && <p className="text-xs text-[#77788B] mt-1 italic">Note: "{req.notes}"</p>}
                    {req.adminNote && (
                      <p className="text-xs text-[#5145E5] mt-1 font-medium">Admin Feedback: "{req.adminNote}"</p>
                    )}
                  </div>
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setActionReqModal({ id: req.id, status: 'APPROVED' })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setActionReqModal({ id: req.id, status: 'REJECTED' })}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 9. SECTION: AI REVIEW */}
      {section === 'ai-review' && (
        <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-[#E2E4EB] pb-3">
            <h2 className="text-sm font-bold text-[#17182B]">AI Evaluation Flags ({flags.length})</h2>
            <p className="text-xs text-[#77788B]">Review candidate contestations and evaluation anomalies</p>
          </div>
          {flags.length === 0 ? (
            <p className="text-xs text-[#77788B] py-6 text-center">
              No evaluation flags found. All mock scoring healthy.
            </p>
          ) : (
            <div className="space-y-3">
              {flags.map((flg) => (
                <div
                  key={flg.id}
                  className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {flg.status}
                    </span>
                    <span className="text-[#77788B]">
                      {flg.reporter?.email || 'Candidate'}
                    </span>
                  </div>
                  <div className="font-semibold text-[#17182B] text-sm">{flg.session.title}</div>
                  <p className="text-[#77788B]">{flg.reason}</p>
                  {flg.status === 'OPEN' && (
                    <div className="flex gap-2 pt-2 border-t border-[#E2E4EB]">
                      <button
                        onClick={() => void handleFlagAction(flg.id, 'RESOLVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => void handleFlagAction(flg.id, 'DISMISSED')}
                        className="px-3 py-1.5 rounded-lg bg-white text-[#77788B] border border-[#E2E4EB] cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 10. SECTION: PLATFORM ANALYTICS */}
      {section === 'analytics' && platformAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E2E4EB] rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block">
                Platform Avg Interview Score
              </span>
              <div className="text-3xl font-bold font-mono text-[#17182B] mt-1">
                {Math.round(platformAnalytics.averageInterviewScore)}%
              </div>
              <span className="text-xs text-[#77788B] font-mono">
                {platformAnalytics.completedInterviewsCount} completed rounds
              </span>
            </div>
            <div className="bg-white border border-[#E2E4EB] rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-[#77788B] uppercase tracking-wider block">
                Coding Submissions
              </span>
              <div className="text-3xl font-bold font-mono text-emerald-600 mt-1">
                {platformAnalytics.codingSubmissions.accepted} / {platformAnalytics.codingSubmissions.total}
              </div>
              <span className="text-xs text-[#77788B] font-mono">Accepted / Total Submissions</span>
            </div>
          </div>

          <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#17182B]">
              Department Distribution (CSE, ECE, EE, ME)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformAnalytics.branchDistribution.map((b) => (
                <div
                  key={b.code}
                  className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] space-y-1.5 text-xs"
                >
                  <div className="font-bold text-[#5145E5] font-mono text-sm">{b.code}</div>
                  <div className="text-[#17182B] font-medium">{b.name}</div>
                  <div className="text-[#77788B] font-mono pt-1 text-[11px]">
                    {b.studentsCount} students • {b.interviewsCount} mocks • {b.resourcesCount} materials
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 11. SECTION: OPS SETTINGS / INTEGRATIONS */}
      {section === 'settings' && overview && (
        <div className="bg-white border border-[#E2E4EB] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#17182B] border-b border-[#E2E4EB] pb-3">
            <ShieldCheck className="w-5 h-5 text-[#5145E5]" />
            <span>External Infrastructure &amp; API Key Telemetry</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
            {[
              { label: 'Google Gemini API', active: overview.integrations.hasGemini },
              { label: 'OpenAI API (Fallback Ready)', active: overview.integrations.hasOpenAi },
              { label: 'OnlineCompiler.io Sandbox', active: overview.integrations.hasOnlineCompiler },
              { label: 'Cloudinary Cloud Storage', active: overview.integrations.hasCloudinary },
              { label: 'SMTP Email Delivery', active: overview.integrations.hasSmtp },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E2E4EB] flex items-center justify-between"
              >
                <span className="text-[#17182B] font-sans font-medium">{item.label}</span>
                <span
                  className={
                    item.active
                      ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1 text-[11px]'
                      : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold text-[11px]'
                  }
                >
                  {item.active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                    </>
                  ) : (
                    'Unconfigured'
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION REQUEST MODAL (Approve / Reject with Admin Note) */}
      {actionReqModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setActionReqModal(null)}
        >
          <div
            className="w-full max-w-md bg-white border border-[#E2E4EB] rounded-2xl shadow-xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
              <h3 className="text-base font-bold text-[#17182B]">
                {actionReqModal.status === 'APPROVED' ? 'Approve Request' : 'Reject Request'}
              </h3>
              <button
                onClick={() => setActionReqModal(null)}
                className="text-[#77788B] hover:text-[#17182B] p-1.5 rounded-lg hover:bg-[#F4F4FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#17182B] block mb-1">
                Admin Note to Candidate (Optional)
              </label>
              <textarea
                rows={3}
                placeholder={
                  actionReqModal.status === 'APPROVED'
                    ? 'e.g., Courseware has been added to CSE Semester 5 library.'
                    : 'e.g., Similar resource already exists under Operating Systems.'
                }
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-3 text-xs text-[#17182B] focus:outline-none focus:border-[#5145E5]"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActionReqModal(null)}
                className="px-4 py-2 rounded-xl bg-[#F4F4FA] text-[#17182B] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequestAction}
                className={`px-5 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer shadow-sm ${
                  actionReqModal.status === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Confirm {actionReqModal.status}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CODING PROBLEM MODAL */}
      {problemModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setProblemModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white border border-[#E2E4EB] rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E4EB] pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#5145E5]" />
                <h3 className="text-base font-bold text-[#17182B]">Add Coding Practice Problem</h3>
              </div>
              <button
                onClick={() => setProblemModalOpen(false)}
                className="text-[#77788B] hover:text-[#17182B] p-1.5 rounded-lg hover:bg-[#F4F4FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCodingProblem} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#17182B] font-semibold block mb-1">Problem Title *</label>
                <input
                  required
                  placeholder="e.g., Subarray Sum Equals K"
                  value={probTitle}
                  onChange={(e) => setProbTitle(e.target.value)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B] focus:outline-none focus:border-[#5145E5]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[#17182B] font-semibold block mb-1">Difficulty</label>
                  <select
                    value={probDifficulty}
                    onChange={(e) => setProbDifficulty(e.target.value as any)}
                    className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-2 py-2 text-[#17182B] focus:outline-none"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#17182B] font-semibold block mb-1">Topic</label>
                  <input
                    required
                    placeholder="e.g., Arrays"
                    value={probTopic}
                    onChange={(e) => setProbTopic(e.target.value)}
                    className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#17182B] font-semibold block mb-1">Rating</label>
                  <input
                    type="number"
                    value={probRating}
                    onChange={(e) => setProbRating(Number(e.target.value))}
                    className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#17182B] font-semibold block mb-1">Problem Description</label>
                <textarea
                  rows={3}
                  placeholder="Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k..."
                  value={probDescription}
                  onChange={(e) => setProbDescription(e.target.value)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl p-2.5 text-[#17182B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#17182B] font-semibold block mb-1">External Practice Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://leetcode.com/problems/subarray-sum-equals-k/"
                  value={probExternalUrl}
                  onChange={(e) => setProbExternalUrl(e.target.value)}
                  className="w-full bg-[#F7F7FC] border border-[#E2E4EB] rounded-xl px-3 py-2 text-[#17182B] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProblemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F4F4FA] text-[#17182B] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white font-semibold shadow-sm cursor-pointer"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
