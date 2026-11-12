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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiError } from '../services/api';
import {
  AdminAiReviewFlagItem,
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
  | 'question-bank'
  | 'requests'
  | 'ai-review'
  | 'analytics'
  | 'settings';

function resolveSection(pathname: string): AdminSection {
  if (pathname.startsWith('/admin/users')) return 'users';
  if (pathname.startsWith('/admin/resources')) return 'resources';
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
  const [questions, setQuestions] = useState<BackendCompanyQuestion[]>([]);
  const [platformAnalytics, setPlatformAnalytics] = useState<Awaited<
    ReturnType<typeof adminService.getPlatformAnalytics>
  > | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add resource form state
  const [resTitle, setResTitle] = useState('');
  const [resBranch, setResBranch] = useState<Branch>('CSE');
  const [resSemester, setResSemester] = useState<number>(5);
  const [resSubject, setResSubject] = useState('');
  const [resTopic, setResTopic] = useState('');
  const [resFormat, setResFormat] = useState<'PDF' | 'NOTES' | 'COMPENDIUM' | 'GATE_PYQS'>('NOTES');
  const [resDesc, setResDesc] = useState('');
  const [resIsPyq, setResIsPyq] = useState(false);

  // Add company question form state
  const [cqCompany, setCqCompany] = useState('Google');
  const [cqRole, setCqRole] = useState('Software Engineer');
  const [cqTitle, setCqTitle] = useState('');
  const [cqQuestionText, setCqQuestionText] = useState('');
  const [cqTopic, setCqTopic] = useState('Algorithms');
  const [cqDifficulty, setCqDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [cqSolution, setCqSolution] = useState('');

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

  const handleRequestAction = async (
    id: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      await adminService.updateResourceRequest(id, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      showToast(`Resource request marked ${status}`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update request',
        'warning'
      );
    }
  };

  const handleFlagAction = async (
    id: string,
    status: 'RESOLVED' | 'DISMISSED'
  ) => {
    try {
      await adminService.resolveAiReview(id, status);
      setFlags((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f))
      );
      showToast(`Flag marked ${status}`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update flag',
        'warning'
      );
    }
  };

  const handleToggleUserStatus = async (u: AdminUserItem) => {
    try {
      await adminService.updateUser(u.id, { isActive: !u.isActive });
      setUsers((prev) =>
        prev.map((item) =>
          item.id === u.id ? { ...item, isActive: !item.isActive } : item
        )
      );
      showToast(`User ${u.email} ${!u.isActive ? 'activated' : 'suspended'}`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update user',
        'warning'
      );
    }
  };

  const handleToggleUserRole = async (u: AdminUserItem) => {
    const nextRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await adminService.updateUser(u.id, { role: nextRole });
      setUsers((prev) =>
        prev.map((item) =>
          item.id === u.id ? { ...item, role: nextRole } : item
        )
      );
      showToast(`Updated role for ${u.email} to ${nextRole}`);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to update user role',
        'warning'
      );
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
        description: resDesc.trim(),
        isGatePyq: resIsPyq || resFormat === 'GATE_PYQS',
        isVerified: true,
      });
      setResources((prev) => [res.resource, ...prev]);
      setResTitle('');
      setResSubject('');
      setResTopic('');
      setResDesc('');
      showToast('Resource published to library');
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to create resource',
        'warning'
      );
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await resourceService.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast('Resource deleted');
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to delete resource',
        'warning'
      );
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
      showToast(
        err instanceof ApiError ? err.message : 'Failed to add question',
        'warning'
      );
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await resourceService.deleteCompanyQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showToast('Question deleted');
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Failed to delete question',
        'warning'
      );
    }
  };

  if (isLoading && !overview) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 rounded-2xl bg-[#242731] border border-[#353946]" />
        <div className="h-64 rounded-2xl bg-[#242731] border border-[#353946]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-[#242731] border border-red-500/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Admin Console Error</span>
          </div>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={loadSectionData}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
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
      {/* Header & Real 6-Metric Bar */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-purple-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ADMIN_OPS // {section.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Admin Operations Console
            </h1>
            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
              Manage platform accounts, engineering curriculum resources, company question bank entries, resource requests, and AI review flags.
            </p>
          </div>

          <button
            onClick={loadSectionData}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#353946] text-xs font-medium text-gray-200 flex items-center gap-1.5 self-start lg:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {m && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-mono uppercase text-gray-400">
                Registered Users
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {m.totalUsers}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {m.activeUsers} active
              </span>
            </div>

            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-mono uppercase text-gray-400">
                Mock Sessions
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {m.totalSessions}
              </div>
              <span className="text-[10px] text-purple-300 font-mono">
                {m.completedSessions} completed
              </span>
            </div>

            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-mono uppercase text-gray-400">
                Study Resources
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {m.totalResources}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                CSE / ECE / EE / ME
              </span>
            </div>

            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-mono uppercase text-gray-400">
                Question Bank
              </span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {m.totalCompanyQuestions + m.totalCodingProblems}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                {m.totalCompanyQuestions} company • {m.totalCodingProblems} code
              </span>
            </div>

            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-mono uppercase text-amber-400">
                Pending Requests
              </span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {m.pendingResourceRequests}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Student submissions
              </span>
            </div>

            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-mono uppercase text-red-400">
                Open AI Flags
              </span>
              <div className="text-2xl font-bold font-mono text-red-400 mt-1">
                {m.openReviewFlags}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                Evaluation reports
              </span>
            </div>
          </div>
        )}
      </section>

      {/* SECTION: OVERVIEW */}
      {section === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#353946] pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Resource Requests Queue
                </h2>
                <p className="text-xs text-gray-400">
                  Student submissions awaiting admin moderation
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-xs">
                {pendingReqCount} Pending
              </span>
            </div>

            {requests.length === 0 ? (
              <p className="p-6 text-center text-xs text-gray-500">
                No resource requests submitted yet.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 6).map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl bg-[#20232C] border border-white/5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-mono text-[10px] font-semibold">
                          {req.branch.code}
                        </span>
                        <span className="text-gray-400 font-mono text-[11px]">
                          {req.user.profile?.fullName || req.user.email}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono text-[10px]">
                          {req.status}
                        </span>
                      </div>
                      <h4 className="font-semibold text-white">{req.title}</h4>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        {req.subject}
                        {req.notes ? ` — ${req.notes}` : ''}
                      </p>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => void handleRequestAction(req.id, 'APPROVED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => void handleRequestAction(req.id, 'REJECTED')}
                          className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
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

          <div className="lg:col-span-5 bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#353946] pb-3">
              <div>
                <h2 className="text-sm font-bold text-white">AI Review &amp; Flags</h2>
                <p className="text-xs text-gray-400">
                  Candidate-reported evaluation reviews
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono text-xs">
                {openFlagCount} Open
              </span>
            </div>

            {flags.length === 0 ? (
              <p className="p-6 text-center text-xs text-gray-500">
                No AI review flags recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {flags.slice(0, 6).map((flg) => (
                  <div
                    key={flg.id}
                    className="p-4 rounded-xl bg-[#20232C] border border-red-500/20 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                        {flg.status}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(flg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-semibold text-white">{flg.session.title}</div>
                    <p className="text-gray-400 text-[11px]">{flg.reason}</p>
                    {flg.status === 'OPEN' && (
                      <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={() => void handleFlagAction(flg.id, 'RESOLVED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-[11px]"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => void handleFlagAction(flg.id, 'DISMISSED')}
                          className="px-2.5 py-1 rounded-lg bg-white/5 text-gray-300 text-[11px]"
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

      {/* SECTION: USERS */}
      {section === 'users' && (
        <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#353946] pb-3">
            <h2 className="text-sm font-bold text-white">Registered Users</h2>
            <div className="flex items-center gap-2 bg-[#20232C] px-3 py-1.5 rounded-xl border border-[#353946]">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search email or name..."
                className="bg-transparent text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-mono uppercase text-gray-400 border-b border-[#353946]">
                <tr>
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Academic</th>
                  <th className="py-2 pr-4">Activity</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 text-right">Status Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white">
                        {u.profile?.fullName || 'Unnamed'}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400">{u.email}</div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-gray-300">
                      {u.academicDetails
                        ? `${u.academicDetails.branch.code} • Sem ${u.academicDetails.semester.number}`
                        : '—'}
                    </td>
                    <td className="py-3 pr-4 font-mono text-[11px] text-gray-400">
                      {u._count.interviewSessions} mocks • {u._count.codingSubmissions} code
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => void handleToggleUserRole(u)}
                        className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-mono text-[10px]"
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => void handleToggleUserStatus(u)}
                        className={`px-3 py-1 rounded-lg font-mono text-[11px] ${
                          u.isActive
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-red-500/15 text-red-300'
                        }`}
                      >
                        {u.isActive ? 'Active (Click to Suspend)' : 'Suspended (Activate)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: RESOURCES */}
      {section === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateResource}
            className="lg:col-span-5 bg-[#242731] border border-[#353946] rounded-2xl p-6 space-y-3 text-xs"
          >
            <div className="flex items-center gap-2 font-bold text-white text-sm pb-2 border-b border-[#353946]">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              <span>Add Study Resource</span>
            </div>
            <input
              required
              placeholder="Title *"
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-white"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={resBranch}
                onChange={(e) => setResBranch(e.target.value as Branch)}
                className="bg-[#20232C] border border-[#353946] rounded-xl px-2 py-2 text-white"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EE">EE</option>
                <option value="ME">ME</option>
              </select>
              <select
                value={resSemester}
                onChange={(e) => setResSemester(Number(e.target.value))}
                className="bg-[#20232C] border border-[#353946] rounded-xl px-2 py-2 text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
              <select
                value={resFormat}
                onChange={(e) =>
                  setResFormat(
                    e.target.value as 'PDF' | 'NOTES' | 'COMPENDIUM' | 'GATE_PYQS'
                  )
                }
                className="bg-[#20232C] border border-[#353946] rounded-xl px-2 py-2 text-white"
              >
                <option value="NOTES">NOTES</option>
                <option value="PDF">PDF</option>
                <option value="COMPENDIUM">COMPENDIUM</option>
                <option value="GATE_PYQS">GATE_PYQS</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="Subject *"
                value={resSubject}
                onChange={(e) => setResSubject(e.target.value)}
                className="bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-white"
              />
              <input
                placeholder="Topic"
                value={resTopic}
                onChange={(e) => setResTopic(e.target.value)}
                className="bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-white"
              />
            </div>
            <textarea
              required
              rows={3}
              placeholder="Description (min 10 chars) *"
              value={resDesc}
              onChange={(e) => setResDesc(e.target.value)}
              className="w-full bg-[#20232C] border border-[#353946] rounded-xl p-3 text-white"
            />
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={resIsPyq}
                onChange={(e) => setResIsPyq(e.target.checked)}
              />
              <span>Mark as branch GATE PYQ archive</span>
            </label>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
            >
              Publish Resource
            </button>
          </form>

          <div className="lg:col-span-7 bg-[#242731] border border-[#353946] rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-[#353946]">
              Existing Resources ({resources.length})
            </h3>
            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {resources.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-[#20232C] border border-white/5 flex items-center justify-between text-xs gap-2"
                >
                  <div>
                    <div className="font-semibold text-white">{r.title}</div>
                    <div className="text-[11px] font-mono text-gray-400">
                      {r.branch.code} • Sem {r.semester.number} • {r.format}
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDeleteResource(r.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
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

      {/* SECTION: QUESTION BANK */}
      {section === 'question-bank' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateCompanyQuestion}
            className="lg:col-span-5 bg-[#242731] border border-[#353946] rounded-2xl p-6 space-y-3 text-xs"
          >
            <div className="flex items-center gap-2 font-bold text-white text-sm pb-2 border-b border-[#353946]">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              <span>Add Company Question</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="Company *"
                value={cqCompany}
                onChange={(e) => setCqCompany(e.target.value)}
                className="bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-white"
              />
              <input
                required
                placeholder="Role *"
                value={cqRole}
                onChange={(e) => setCqRole(e.target.value)}
                className="bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-white"
              />
            </div>
            <input
              required
              placeholder="Title *"
              value={cqTitle}
              onChange={(e) => setCqTitle(e.target.value)}
              className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="Topic *"
                value={cqTopic}
                onChange={(e) => setCqTopic(e.target.value)}
                className="bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-white"
              />
              <select
                value={cqDifficulty}
                onChange={(e) =>
                  setCqDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')
                }
                className="bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-white"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <textarea
              required
              rows={2}
              placeholder="Question prompt *"
              value={cqQuestionText}
              onChange={(e) => setCqQuestionText(e.target.value)}
              className="w-full bg-[#20232C] border border-[#353946] rounded-xl p-3 text-white"
            />
            <textarea
              required
              rows={2}
              placeholder="Solution summary *"
              value={cqSolution}
              onChange={(e) => setCqSolution(e.target.value)}
              className="w-full bg-[#20232C] border border-[#353946] rounded-xl p-3 text-white"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
            >
              Add Question
            </button>
          </form>

          <div className="lg:col-span-7 bg-[#242731] border border-[#353946] rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-[#353946]">
              Company Questions ({questions.length})
            </h3>
            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-[#20232C] border border-white/5 flex items-center justify-between text-xs gap-2"
                >
                  <div>
                    <div className="font-semibold text-white">{q.title}</div>
                    <div className="text-[11px] font-mono text-gray-400">
                      {q.company.name} • {q.topic} • {q.difficulty}
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
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

      {/* SECTION: REQUESTS */}
      {section === 'requests' && (
        <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-white pb-2 border-b border-[#353946]">
            All Student Resource Requests ({requests.length})
          </h2>
          {requests.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No resource requests found.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#20232C] border border-white/5 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
                        {req.branch.code}
                      </span>
                      <span className="text-gray-300">{req.status}</span>
                      <span className="text-gray-500">{req.user.email}</span>
                    </div>
                    <div className="font-semibold text-white mt-1">{req.title}</div>
                    <p className="text-gray-400 text-[11px]">{req.subject}</p>
                  </div>
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => void handleRequestAction(req.id, 'APPROVED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-[11px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => void handleRequestAction(req.id, 'REJECTED')}
                        className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-300 text-[11px]"
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

      {/* SECTION: AI REVIEW */}
      {section === 'ai-review' && (
        <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-white pb-2 border-b border-[#353946]">
            AI Evaluation Flags ({flags.length})
          </h2>
          {flags.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No evaluation flags found.
            </p>
          ) : (
            <div className="space-y-3">
              {flags.map((flg) => (
                <div
                  key={flg.id}
                  className="p-4 rounded-xl bg-[#20232C] border border-[#353946] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-red-300 font-bold">{flg.status}</span>
                    <span className="text-gray-500">
                      {flg.reporter?.email || 'Candidate'}
                    </span>
                  </div>
                  <div className="font-semibold text-white">{flg.session.title}</div>
                  <p className="text-gray-400">{flg.reason}</p>
                  {flg.status === 'OPEN' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => void handleFlagAction(flg.id, 'RESOLVED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => void handleFlagAction(flg.id, 'DISMISSED')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-gray-300"
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

      {/* SECTION: PLATFORM ANALYTICS */}
      {section === 'analytics' && platformAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5">
              <span className="text-[10px] font-mono uppercase text-gray-400">
                Platform Avg Interview Score
              </span>
              <div className="text-3xl font-bold font-mono text-white mt-1">
                {Math.round(platformAnalytics.averageInterviewScore)}%
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {platformAnalytics.completedInterviewsCount} completed rounds
              </span>
            </div>
            <div className="bg-[#242731] border border-[#353946] rounded-2xl p-5">
              <span className="text-[10px] font-mono uppercase text-gray-400">
                Coding Sandbox Submissions
              </span>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                {platformAnalytics.codingSubmissions.accepted} /{' '}
                {platformAnalytics.codingSubmissions.total}
              </div>
              <span className="text-xs text-gray-400 font-mono">Accepted / Total</span>
            </div>
          </div>

          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Department Distribution (CSE, ECE, EE, ME)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformAnalytics.branchDistribution.map((b) => (
                <div
                  key={b.code}
                  className="p-4 rounded-xl bg-[#20232C] border border-white/5 space-y-1 text-xs"
                >
                  <div className="font-bold text-purple-300 font-mono">{b.code}</div>
                  <div className="text-gray-300">{b.name}</div>
                  <div className="text-gray-400 font-mono pt-1">
                    {b.studentsCount} students • {b.interviewsCount} mocks •{' '}
                    {b.resourcesCount} resources
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: OPS SETTINGS / INTEGRATIONS */}
      {section === 'settings' && overview && (
        <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-[#353946] pb-3">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>External Service &amp; API Key Status</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
            {[
              { label: 'Google Gemini API', active: overview.integrations.hasGemini },
              { label: 'OpenAI API (Fallback Ready)', active: overview.integrations.hasOpenAi },
              { label: 'OnlineCompiler.io Sandbox', active: overview.integrations.hasOnlineCompiler },
              { label: 'Cloudinary Uploads', active: overview.integrations.hasCloudinary },
              { label: 'SMTP Email Delivery', active: overview.integrations.hasSmtp },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-[#20232C] border border-white/5 flex items-center justify-between"
              >
                <span className="text-gray-300">{item.label}</span>
                <span
                  className={
                    item.active
                      ? 'text-emerald-400 font-semibold flex items-center gap-1'
                      : 'text-amber-300'
                  }
                >
                  {item.active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Configured
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
    </div>
  );
};
