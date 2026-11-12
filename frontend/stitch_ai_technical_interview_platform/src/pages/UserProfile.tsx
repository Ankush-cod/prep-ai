// src/pages/UserProfile.tsx
import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  School,
  CheckCircle2,
  Save,
  Building2,
  Terminal,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Branch } from '../types/prepai';

function parseCommaList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { profile, updateProfile, showToast } = useApp();

  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [institution, setInstitution] = useState(profile.institution);
  const [rollNumber, setRollNumber] = useState(profile.rollNumber);
  const [branch, setBranch] = useState<Branch>(profile.branch || 'CSE');
  const [academicYear, setAcademicYear] = useState<number>(profile.academicYear || 1);
  const [semester, setSemester] = useState<number>(profile.semester || 1);
  const [graduationYear, setGraduationYear] = useState<string>(
    profile.graduationYear ? String(profile.graduationYear) : ''
  );
  const [cgpa, setCgpa] = useState<string>(profile.cgpa ? String(profile.cgpa) : '');
  const [targetCompensation, setTargetCompensation] = useState(profile.targetCompensation);

  const [languagesInput, setLanguagesInput] = useState('');
  const [systemsInput, setSystemsInput] = useState('');
  const [theoryInput, setTheoryInput] = useState('');
  const [rolesInput, setRolesInput] = useState('');
  const [companiesInput, setCompaniesInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFullName(profile.fullName || '');
    setPhone(profile.phone || '');
    setInstitution(profile.institution || '');
    setRollNumber(profile.rollNumber || '');
    setBranch(profile.branch || 'CSE');
    setAcademicYear(profile.academicYear || 1);
    setSemester(profile.semester || 1);
    setGraduationYear(profile.graduationYear ? String(profile.graduationYear) : '');
    setCgpa(profile.cgpa ? String(profile.cgpa) : '');
    setTargetCompensation(profile.targetCompensation || '');
    setLanguagesInput(profile.skills.languages.map((l) => l.name).join(', '));
    setSystemsInput(profile.skills.systems.join(', '));
    setTheoryInput(profile.skills.theory.join(', '));
    setRolesInput(profile.targetRoles.join(', '));
    setCompaniesInput(profile.targetCompanies.join(', '));
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full name is required.', 'warning');
      return;
    }
    const parsedCgpa = cgpa.trim() ? parseFloat(cgpa) : undefined;
    if (
      parsedCgpa !== undefined &&
      (Number.isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10)
    ) {
      showToast('CGPA must be a number between 0 and 10.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        institution: institution.trim(),
        rollNumber: rollNumber.trim(),
        branch,
        academicYear,
        semester,
        graduationYear: graduationYear.trim() ? parseInt(graduationYear, 10) : undefined,
        cgpa: parsedCgpa,
        targetCompensation: targetCompensation.trim(),
        targetRoles: parseCommaList(rolesInput),
        targetCompanies: parseCommaList(companiesInput),
        skills: {
          languages: parseCommaList(languagesInput).map((name) => ({
            name,
            level: 'Proficient',
          })),
          systems: parseCommaList(systemsInput),
          theory: parseCommaList(theoryInput),
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Dossier Overview Top Banner */}
      <section className="relative rounded-2xl bg-[#242731] border border-[#353946] p-6 lg:p-8 shadow-xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-48 h-48 rounded-full bg-cyan-600/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Student Academic &amp; Career Profile
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Candidate Profile &amp; Preparation Dossier
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Manage personal details, B.Tech academic enrollment (branch, year, semester, CGPA), technical skills, and target interview preferences.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#20232C] p-3 rounded-2xl border border-[#353946] shadow-inner self-start lg:self-auto">
            <div className="px-3 py-1 border-r border-[#353946] text-left">
              <span className="block text-[10px] font-mono text-gray-500 uppercase">
                Branch
              </span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {branch}
              </span>
            </div>
            <div className="px-3 py-1 border-r border-[#353946] text-left">
              <span className="block text-[10px] font-mono text-gray-500 uppercase">
                Academic
              </span>
              <span className="text-sm font-bold font-mono text-purple-400">
                Y{academicYear} • S{semester}
              </span>
            </div>
            <div className="px-3 py-1 text-left">
              <span className="block text-[10px] font-mono text-gray-500 uppercase">
                CGPA
              </span>
              <span className="text-sm font-bold font-mono text-cyan-400">
                {profile.cgpa ? `${profile.cgpa}/10` : 'Unset'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Grid */}
      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Left Column (5 cols): Identity & Academic Standing */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#353946]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Candidate Identity
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                {user?.isEmailVerified ? 'Email Verified' : 'Unverified Email'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-700/30 text-purple-300 font-bold text-xl flex items-center justify-center border border-purple-500/40 shadow-inner">
                {profile.initials}
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                  {fullName || 'Student'}
                  {user?.isEmailVerified && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  )}
                </h4>
                <span className="text-xs font-mono text-purple-400 block mt-0.5">
                  {rollNumber ? `${rollNumber} • ` : ''}
                  {branch} Dept • Year {academicYear}, Sem {semester}
                </span>
                <span className="text-[11px] text-gray-500 block mt-1">
                  {institution || 'Add your university or college name below'}
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full bg-[#20232C]/60 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-400 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="+91 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Standing */}
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#353946]">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Academic Standing
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                  University / College Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your college or university"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                    Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as Branch)}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EE">EE</option>
                    <option value="ME">ME</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2201CS45"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                    Current Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                    CGPA (0–10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g., 8.50"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 2027"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Skills & Placement Goals */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#353946]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Technical Competence Taxonomy
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-mono uppercase text-gray-400 block mb-1.5">
                  Programming Languages (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., C++, Python, TypeScript, Java"
                  value={languagesInput}
                  onChange={(e) => setLanguagesInput(e.target.value)}
                  className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-gray-400 block mb-1.5">
                  Systems, Frameworks &amp; Tools (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., React, Express, PostgreSQL, Docker"
                  value={systemsInput}
                  onChange={(e) => setSystemsInput(e.target.value)}
                  className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-gray-400 block mb-1.5">
                  Core Engineering Subjects (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Operating Systems, DBMS, Computer Networks"
                  value={theoryInput}
                  onChange={(e) => setTheoryInput(e.target.value)}
                  className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#242731] border border-[#353946] rounded-2xl p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#353946]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Placement Target Calibrations
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-mono uppercase text-gray-400 block mb-1.5">
                  Target Roles (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer, Embedded Systems Engineer"
                  value={rolesInput}
                  onChange={(e) => setRolesInput(e.target.value)}
                  className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-gray-400 block mb-1.5">
                  Target Companies (comma-separated)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g., Google, Microsoft, Qualcomm, Texas Instruments"
                    value={companiesInput}
                    onChange={(e) => setCompaniesInput(e.target.value)}
                    className="w-full bg-[#20232C] border border-[#353946] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 uppercase font-mono text-[10px] block mb-1">
                  Target Compensation Band (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 18–24 LPA"
                  value={targetCompensation}
                  onChange={(e) => setTargetCompensation(e.target.value)}
                  className="w-full bg-[#20232C] border border-[#353946] rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-[0_0_16px_rgba(139,92,246,0.4)] transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
