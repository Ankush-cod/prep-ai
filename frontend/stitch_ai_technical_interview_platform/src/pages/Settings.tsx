// src/pages/Settings.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  UserCog,
  GraduationCap,
  Bot,
  Bell,
  Shield,
  Palette,
  Save,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  LogOut,
  Trash2,
  Monitor,
  Moon,
  Sun,
  Laptop,
  Eye,
  EyeOff,
  Plus,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import { ActiveSessionInfo, analyticsService } from '../services/analyticsService';
import { Branch } from '../types/prepai';
import { applyTheme, ThemePreference } from '../utils/theme';

type SettingsSection =
  | 'account'
  | 'profile'
  | 'academic'
  | 'interview'
  | 'notifications'
  | 'security'
  | 'appearance';

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  title,
  description,
  checked,
  onChange,
  disabled,
}) => (
  <div className="flex items-center justify-between gap-4 py-4">
    <div className="space-y-0.5 pr-4">
      <div className="text-sm font-medium text-[#F1F2F5]">{title}</div>
      <div className="text-xs text-[#A1A5B2] leading-relaxed">{description}</div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 disabled:opacity-50 ${
        checked
          ? 'bg-[#8B5CF6] border-[#8B5CF6]'
          : 'bg-[#20232C] border-[#353946]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        } mt-[1px]`}
      />
    </button>
  </div>
);

const DEFAULT_TOPIC_SUGGESTIONS = [
  'Data Structures',
  'Algorithms',
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'System Design',
  'OOP',
];

export const Settings: React.FC = () => {
  const { profile, updateProfile, showToast } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Account & Profile state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRolesInput, setTargetRolesInput] = useState('');
  const [targetCompaniesInput, setTargetCompaniesInput] = useState('');

  // Academic state
  const [institution, setInstitution] = useState('');
  const [branch, setBranch] = useState<Branch>('CSE');
  const [academicYear, setAcademicYear] = useState<number>(3);
  const [semester, setSemester] = useState<number>(5);
  const [rollNumber, setRollNumber] = useState('');

  // Interview Preferences state
  const [preferredInterviewType, setPreferredInterviewType] = useState('TECHNICAL');
  const [defaultDifficulty, setDefaultDifficulty] = useState('Medium');
  const [preferredCodingLang, setPreferredCodingLang] = useState('cpp');
  const [preferredTopics, setPreferredTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [resumePersonalization, setResumePersonalization] = useState(true);
  const [strictInterviewRubric, setStrictInterviewRubric] = useState(true);

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [interviewReportNotifications, setInterviewReportNotifications] = useState(true);
  const [preparationReminders, setPreparationReminders] = useState(true);
  const [platformAnnouncements, setPlatformAnnouncements] = useState(false);

  // Appearance state
  const [theme, setTheme] = useState<ThemePreference>('dark');

  // Security & Sessions state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [sessions, setSessions] = useState<ActiveSessionInfo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSecurityActionLoading, setIsSecurityActionLoading] = useState(false);

  const loadAllSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [settingsData, profileData] = await Promise.all([
        analyticsService.getSettings(),
        analyticsService.getProfile(),
      ]);

      setFullName(profileData.profile?.fullName || '');
      setBio(profileData.profile?.bio || '');
      setPhone(profileData.profile?.phone || '');
      setTargetRolesInput((profileData.profile?.targetRoles || []).join(', '));
      setTargetCompaniesInput((profileData.profile?.targetCompanies || []).join(', '));

      if (profileData.academicDetails) {
        setInstitution(profileData.academicDetails.institution || '');
        setBranch((profileData.academicDetails.branch?.code as Branch) || 'CSE');
        setAcademicYear(profileData.academicDetails.academicYear || 1);
        setSemester(profileData.academicDetails.semester?.number || 1);
        setRollNumber(profileData.academicDetails.rollNumber || '');
      }

      setEmailNotifications(settingsData.emailNotifications);
      setInterviewReminders(settingsData.interviewReminders);
      setInterviewReportNotifications(settingsData.interviewReportNotifications ?? true);
      setPreparationReminders(settingsData.preparationReminders ?? true);
      setPlatformAnnouncements(settingsData.platformAnnouncements ?? false);

      setPreferredCodingLang(settingsData.preferredCodingLang || 'cpp');
      setPreferredInterviewType(settingsData.preferredInterviewType || 'TECHNICAL');
      setDefaultDifficulty(settingsData.defaultDifficulty || 'Medium');
      setPreferredTopics(settingsData.preferredTopics || []);
      setResumePersonalization(settingsData.resumePersonalization ?? true);
      setStrictInterviewRubric(settingsData.strictInterviewRubric ?? true);

      const loadedTheme: ThemePreference =
        settingsData.theme === 'light' || settingsData.theme === 'system'
          ? settingsData.theme
          : 'dark';
      setTheme(loadedTheme);
      applyTheme(loadedTheme);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Failed to load settings from server.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const list = await analyticsService.listSessions();
      setSessions(list);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllSettings();
  }, [loadAllSettings]);

  useEffect(() => {
    if (activeSection === 'security') {
      void loadSessions();
    }
  }, [activeSection, loadSessions]);

  const switchSection = (section: SettingsSection) => {
    setActiveSection(section);
    setStatusMessage(null);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setStatusMessage({ type: 'error', text: 'Full name must be at least 2 characters.' });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ fullName: trimmedName });
      setStatusMessage({ type: 'success', text: 'Account details updated.' });
      showToast('Account details saved');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update account.';
      setStatusMessage({ type: 'error', text: msg });
      showToast(msg, 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setStatusMessage({ type: 'error', text: 'Display name must be at least 2 characters.' });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        fullName: trimmedName,
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        targetRoles: targetRolesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        targetCompanies: targetCompaniesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setStatusMessage({ type: 'success', text: 'Profile settings saved to database.' });
      showToast('Profile settings saved');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save profile settings.';
      setStatusMessage({ type: 'error', text: msg });
      showToast(msg, 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAcademic = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (institution.trim().length < 2) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid college or university name.' });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        institution: institution.trim(),
        branch,
        academicYear,
        semester,
        rollNumber: rollNumber.trim() || null,
      });
      setStatusMessage({ type: 'success', text: 'Academic preferences updated.' });
      showToast('Academic preferences saved');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save academic preferences.';
      setStatusMessage({ type: 'error', text: msg });
      showToast(msg, 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInterviewPrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSaving(true);
    try {
      await analyticsService.updateSettings({
        preferredInterviewType,
        defaultDifficulty,
        preferredCodingLang,
        preferredTopics,
        resumePersonalization,
        strictInterviewRubric,
      });
      setStatusMessage({ type: 'success', text: 'Interview preferences saved.' });
      showToast('Interview preferences saved');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save interview preferences.';
      setStatusMessage({ type: 'error', text: msg });
      showToast(msg, 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const persistNotificationToggle = async (
    patch: Partial<{
      emailNotifications: boolean;
      interviewReminders: boolean;
      interviewReportNotifications: boolean;
      preparationReminders: boolean;
      platformAnnouncements: boolean;
    }>
  ) => {
    setStatusMessage(null);
    try {
      await analyticsService.updateSettings(patch);
      showToast('Notification preference updated');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update notification setting.';
      setStatusMessage({ type: 'error', text: msg });
      showToast(msg, 'warning');
      void loadAllSettings();
    }
  };

  const handleThemeChange = async (nextTheme: ThemePreference) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setStatusMessage(null);
    try {
      await analyticsService.updateSettings({ theme: nextTheme });
      setStatusMessage({ type: 'success', text: `Theme switched to ${nextTheme} mode.` });
      showToast('Appearance preference saved');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to persist theme preference.';
      setStatusMessage({ type: 'error', text: msg });
      showToast(msg, 'warning');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!currentPassword || !newPassword) {
      setStatusMessage({ type: 'error', text: 'Enter both your current password and new password.' });
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setStatusMessage({
        type: 'error',
        text: 'New password must be at least 8 characters with uppercase, lowercase, and a number.',
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsSaving(true);
    try {
      await analyticsService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setStatusMessage({ type: 'success', text: 'Password updated successfully.' });
      showToast('Password updated successfully');
      void loadSessions();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update password.';
      setStatusMessage({ type: 'error', text: msg });
      showToast(msg, 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsSecurityActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await analyticsService.logoutAllDevices();
      showToast(res.message);
      await logout();
      navigate('/login');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to sign out all devices.';
      setStatusMessage({ type: 'error', text: msg });
      showToast(msg, 'warning');
    } finally {
      setIsSecurityActionLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      setStatusMessage({ type: 'error', text: 'Enter your password to confirm account deletion.' });
      return;
    }
    setIsSecurityActionLoading(true);
    setStatusMessage(null);
    try {
      await analyticsService.deleteAccount(deletePassword);
      showToast('Account deleted permanently.');
      await logout();
      navigate('/');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete account.';
      setStatusMessage({ type: 'error', text: msg });
      showToast(msg, 'warning');
    } finally {
      setIsSecurityActionLoading(false);
    }
  };

  const addTopic = (topic: string) => {
    const clean = topic.trim();
    if (!clean || preferredTopics.includes(clean)) return;
    setPreferredTopics((prev) => [...prev, clean]);
    setNewTopic('');
  };

  const navItems: { id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'profile', label: 'Profile Settings', icon: UserCog },
    { id: 'academic', label: 'Academic Preferences', icon: GraduationCap },
    { id: 'interview', label: 'Interview Preferences', icon: Bot },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const initials = (fullName || profile.fullName || 'ST')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || 'ST';

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-16 rounded-xl bg-[#242731] border border-[#353946]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 h-80 rounded-xl bg-[#242731] border border-[#353946]" />
          <div className="lg:col-span-9 h-96 rounded-xl bg-[#242731] border border-[#353946]" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="bg-[#242731] border border-red-500/40 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Unable to load Settings</span>
          </div>
          <p className="text-xs text-[#A1A5B2]">{loadError}</p>
          <button
            onClick={loadAllSettings}
            className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <header className="border-b border-[#353946] pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-[#F1F2F5] text-white">
          Settings
        </h1>
        <p className="text-sm text-[#A1A5B2] mt-1">
          Manage your PrepAI account, academic profile, interview defaults, notifications, and appearance.
        </p>
      </header>

      {/* Mobile Category Selector */}
      <div className="lg:hidden space-y-3">
        <select
          value={activeSection}
          onChange={(e) => switchSection(e.target.value as SettingsSection)}
          aria-label="Settings Category"
          className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
        >
          {navItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchSection(item.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-[#8B5CF6]/15 text-[#F1F2F5] border-[#8B5CF6]/40'
                    : 'bg-[#242731] text-[#A1A5B2] border-[#353946] hover:text-[#F1F2F5]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Navigation Sidebar (Desktop & Tablet) */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-6">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    active
                      ? 'bg-[#292D38] text-white border-l-2 border-[#8B5CF6]'
                      : 'text-[#A1A5B2] hover:bg-[#242731] hover:text-[#F1F2F5]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#8B5CF6]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Panel */}
        <div className="flex-1 w-full bg-[#242731] border border-[#353946] rounded-xl p-5 sm:p-7 space-y-6">
          {statusMessage && (
            <div
              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-medium border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 1. ACCOUNT */}
          {activeSection === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-6">
              <div className="border-b border-[#353946] pb-4">
                <h2 className="text-lg font-semibold text-white">Account</h2>
                <p className="text-xs text-[#A1A5B2] mt-1">
                  Review your primary account identity, verification status, and security shortcuts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || profile.email}
                    disabled
                    className="w-full rounded-lg bg-[#20232C]/60 border border-[#353946] px-3.5 py-2.5 text-sm text-[#A1A5B2] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="border-t border-[#353946] pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">Account Status</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A5B2]">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium border ${
                        user?.isEmailVerified
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {user?.isEmailVerified ? 'Email Verified' : 'Verification Pending'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#292D38] border border-[#353946] text-[#F1F2F5]">
                      Role: {user?.role || 'USER'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => switchSection('security')}
                  className="px-4 py-2 rounded-lg bg-[#292D38] hover:bg-[#353946] border border-[#353946] text-xs font-medium text-[#F1F2F5] transition-colors self-start sm:self-auto"
                >
                  Change Password
                </button>
              </div>

              <div className="border-t border-[#353946] pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Account'}</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. PROFILE SETTINGS */}
          {activeSection === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-[#353946] pb-4">
                <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
                <p className="text-xs text-[#A1A5B2] mt-1">
                  Customize your public candidate profile, bio, and target placement goals.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-lg font-semibold text-[#8B5CF6] shrink-0">
                  {initials}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-white">
                    {fullName || profile.fullName}
                  </div>
                  <div className="text-xs text-[#A1A5B2]">
                    Avatar initials are automatically generated from your display name.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#A1A5B2]">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your engineering interests, core stack, or interview goals..."
                  className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6] resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Target Roles (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={targetRolesInput}
                    onChange={(e) => setTargetRolesInput(e.target.value)}
                    placeholder="SDE-1, Backend Engineer"
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Target Companies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={targetCompaniesInput}
                    onChange={(e) => setTargetCompaniesInput(e.target.value)}
                    placeholder="Google, Amazon, Atlassian"
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="border-t border-[#353946] pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. ACADEMIC PREFERENCES */}
          {activeSection === 'academic' && (
            <form onSubmit={handleSaveAcademic} className="space-y-6">
              <div className="border-b border-[#353946] pb-4">
                <h2 className="text-lg font-semibold text-white">Academic Preferences</h2>
                <p className="text-xs text-[#A1A5B2] mt-1">
                  Your branch and semester tailor preparation resources, mock interviews, and analytics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g., MANIT Bhopal"
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as Branch)}
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="CSE">CSE — Computer Science</option>
                    <option value="ECE">ECE — Electronics &amp; Communication</option>
                    <option value="EE">EE — Electrical Engineering</option>
                    <option value="ME">ME — Mechanical Engineering</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Roll Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g., 24112011374"
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    {[1, 2, 3, 4].map((yr) => (
                      <option key={yr} value={yr}>
                        Year {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Current Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-[#353946] pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Academic Preferences'}</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. INTERVIEW PREFERENCES */}
          {activeSection === 'interview' && (
            <form onSubmit={handleSaveInterviewPrefs} className="space-y-6">
              <div className="border-b border-[#353946] pb-4">
                <h2 className="text-lg font-semibold text-white">Interview Preferences</h2>
                <p className="text-xs text-[#A1A5B2] mt-1">
                  Configure your default AI mock interview track, difficulty, and coding sandbox language.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Preferred Interview Type
                  </label>
                  <select
                    value={preferredInterviewType}
                    onChange={(e) => setPreferredInterviewType(e.target.value)}
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="TECHNICAL">Technical Core</option>
                    <option value="DSA">DSA &amp; Problem Solving</option>
                    <option value="SYSTEM_DESIGN">System Design</option>
                    <option value="RESUME_BASED">Resume Deep-Dive</option>
                    <option value="HR">HR &amp; Behavioral</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Default Difficulty
                  </label>
                  <select
                    value={defaultDifficulty}
                    onChange={(e) => setDefaultDifficulty(e.target.value)}
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#A1A5B2]">
                    Preferred Language
                  </label>
                  <select
                    value={preferredCodingLang}
                    onChange={(e) => setPreferredCodingLang(e.target.value)}
                    className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="cpp">C++ (G++ 15)</option>
                    <option value="python">Python 3.14</option>
                    <option value="java">Java (OpenJDK 25)</option>
                    <option value="javascript">JavaScript (Node 24)</option>
                    <option value="go">Go 1.26</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-[#353946] pt-5">
                <label className="block text-xs font-medium text-[#A1A5B2]">
                  Preferred Technical Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {preferredTopics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs text-[#F1F2F5]"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() =>
                          setPreferredTopics((prev) => prev.filter((t) => t !== topic))
                        }
                        className="text-[#A1A5B2] hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {preferredTopics.length === 0 && (
                    <span className="text-xs text-[#A1A5B2]">No topics selected yet.</span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTopic(newTopic);
                      }
                    }}
                    placeholder="Add a technical topic..."
                    className="flex-1 rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2 text-xs text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                  />
                  <button
                    type="button"
                    onClick={() => addTopic(newTopic)}
                    className="px-3.5 py-2 rounded-lg bg-[#292D38] hover:bg-[#353946] border border-[#353946] text-xs font-medium text-[#F1F2F5] inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {DEFAULT_TOPIC_SUGGESTIONS.filter((s) => !preferredTopics.includes(s)).map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addTopic(suggestion)}
                        className="px-2.5 py-1 rounded-md bg-[#20232C] hover:bg-[#292D38] border border-[#353946] text-[11px] text-[#A1A5B2] hover:text-[#F1F2F5] transition-colors"
                      >
                        + {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="border-t border-[#353946] divide-y divide-[#353946]">
                <ToggleRow
                  title="Resume-based Personalization"
                  description="Use your uploaded resume skills and projects to tailor AI interview questions."
                  checked={resumePersonalization}
                  onChange={setResumePersonalization}
                />
                <ToggleRow
                  title="Strict Evaluation Rubric"
                  description="Apply FAANG-level grading standards with deeper follow-up probes."
                  checked={strictInterviewRubric}
                  onChange={setStrictInterviewRubric}
                />
              </div>

              <div className="border-t border-[#353946] pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Interview Preferences'}</span>
                </button>
              </div>
            </form>
          )}

          {/* 5. NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-[#353946] pb-4">
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
                <p className="text-xs text-[#A1A5B2] mt-1">
                  Control which email notifications and preparation reminders are sent to your inbox. Changes save automatically.
                </p>
              </div>

              <div className="divide-y divide-[#353946]">
                <ToggleRow
                  title="Email Notifications"
                  description="Receive essential account alerts, security notices, and workspace updates."
                  checked={emailNotifications}
                  onChange={(next) => {
                    setEmailNotifications(next);
                    void persistNotificationToggle({ emailNotifications: next });
                  }}
                />
                <ToggleRow
                  title="Interview Reminders"
                  description="Get reminders for scheduled mock interviews and practice streaks."
                  checked={interviewReminders}
                  onChange={(next) => {
                    setInterviewReminders(next);
                    void persistNotificationToggle({ interviewReminders: next });
                  }}
                />
                <ToggleRow
                  title="Interview Report Notifications"
                  description="Receive a summary email when your AI evaluation report is ready."
                  checked={interviewReportNotifications}
                  onChange={(next) => {
                    setInterviewReportNotifications(next);
                    void persistNotificationToggle({ interviewReportNotifications: next });
                  }}
                />
                <ToggleRow
                  title="Preparation Reminders"
                  description="Weekly nudges for unfinished DSA topics and branch study tracks."
                  checked={preparationReminders}
                  onChange={(next) => {
                    setPreparationReminders(next);
                    void persistNotificationToggle({ preparationReminders: next });
                  }}
                />
                <ToggleRow
                  title="Platform Announcements"
                  description="Updates on new coding problems, company question banks, and platform features."
                  checked={platformAnnouncements}
                  onChange={(next) => {
                    setPlatformAnnouncements(next);
                    void persistNotificationToggle({ platformAnnouncements: next });
                  }}
                />
              </div>
            </div>
          )}

          {/* 6. PRIVACY & SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-8">
              <div className="border-b border-[#353946] pb-4">
                <h2 className="text-lg font-semibold text-white">Privacy &amp; Security</h2>
                <p className="text-xs text-[#A1A5B2] mt-1">
                  Update your password, review active login sessions, or manage account access.
                </p>
              </div>

              {/* Change Password */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Change Password</h3>
                  <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="text-xs text-[#A1A5B2] hover:text-white inline-flex items-center gap-1"
                  >
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPasswords ? 'Hide' : 'Show'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#A1A5B2]">
                      Current Password
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#A1A5B2]">
                      New Password
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#A1A5B2]">
                      Confirm New Password
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full rounded-lg bg-[#20232C] border border-[#353946] px-3.5 py-2.5 text-sm text-[#F1F2F5] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>

              {/* Active Sessions */}
              <div className="border-t border-[#353946] pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Active Sessions</h3>
                    <p className="text-xs text-[#A1A5B2]">
                      Signed-in refresh tokens currently valid for your account.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogoutAllDevices}
                    disabled={isSecurityActionLoading}
                    className="px-3.5 py-2 rounded-lg bg-[#292D38] hover:bg-[#353946] border border-[#353946] text-xs font-medium text-[#F1F2F5] inline-flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout from all devices</span>
                  </button>
                </div>

                <div className="rounded-lg bg-[#20232C] border border-[#353946] divide-y divide-[#353946]">
                  {sessionsLoading ? (
                    <div className="p-4 text-xs text-[#A1A5B2]">Loading active sessions...</div>
                  ) : sessions.length === 0 ? (
                    <div className="p-4 text-xs text-[#A1A5B2]">
                      No active refresh sessions found.
                    </div>
                  ) : (
                    sessions.map((s, idx) => (
                      <div
                        key={s.id}
                        className="p-3.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Laptop className="w-4 h-4 text-[#8B5CF6]" />
                          <div>
                            <div className="text-[#F1F2F5] font-medium">
                              Session #{idx + 1}
                            </div>
                            <div className="text-[#A1A5B2]">
                              Started {new Date(s.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          Expires {new Date(s.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Account Deletion */}
              <div className="border-t border-[#353946] pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-red-400">Delete Account</h3>
                    <p className="text-xs text-[#A1A5B2]">
                      Permanently delete your account, interview history, resumes, and submissions. This cannot be undone.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm((v) => !v)}
                    className="px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-medium text-red-300 inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>

                {showDeleteConfirm && (
                  <form
                    onSubmit={handleDeleteAccount}
                    className="p-4 rounded-lg bg-red-500/5 border border-red-500/30 space-y-3"
                  >
                    <p className="text-xs text-red-200">
                      Enter your current password to permanently delete your PrepAI account:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Confirm password"
                        className="flex-1 rounded-lg bg-[#20232C] border border-red-500/40 px-3.5 py-2 text-xs text-[#F1F2F5] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isSecurityActionLoading}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        {isSecurityActionLoading ? 'Deleting...' : 'Confirm Permanent Delete'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* 7. APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div className="border-b border-[#353946] pb-4">
                <h2 className="text-lg font-semibold text-white">Appearance</h2>
                <p className="text-xs text-[#A1A5B2] mt-1">
                  Choose your preferred interface theme. Changes apply immediately and sync to your profile.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: 'dark' as const,
                    label: 'Dark Mode',
                    desc: 'Soft charcoal surfaces (#191B22) with purple accents.',
                    icon: Moon,
                    previewBg: 'bg-[#191B22]',
                    previewCard: 'bg-[#242731]',
                  },
                  {
                    id: 'light' as const,
                    label: 'Light Mode',
                    desc: 'Clean daylight surfaces with crisp contrast.',
                    icon: Sun,
                    previewBg: 'bg-[#F4F5F8]',
                    previewCard: 'bg-white',
                  },
                  {
                    id: 'system' as const,
                    label: 'System Preference',
                    desc: 'Automatically match your OS appearance setting.',
                    icon: Monitor,
                    previewBg: 'bg-gradient-to-r from-[#191B22] to-[#F4F5F8]',
                    previewCard: 'bg-[#242731]',
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => void handleThemeChange(opt.id)}
                      className={`p-4 rounded-xl border text-left transition-all space-y-3 ${
                        active
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10'
                          : 'border-[#353946] bg-[#20232C] hover:border-[#8B5CF6]/50'
                      }`}
                    >
                      <div
                        className={`h-16 rounded-lg border border-[#353946] p-2.5 flex items-end ${opt.previewBg}`}
                      >
                        <div className={`w-full h-6 rounded border border-[#353946]/60 ${opt.previewCard}`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                          <Icon className="w-4 h-4 text-[#8B5CF6]" />
                          <span>{opt.label}</span>
                        </div>
                        {active && <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />}
                      </div>
                      <p className="text-xs text-[#A1A5B2] leading-relaxed">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
