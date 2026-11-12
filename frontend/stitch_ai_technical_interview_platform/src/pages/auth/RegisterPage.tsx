// src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Cpu,
  Calendar,
  BookOpen,
  Building2,
  UserPlus,
  Loader2,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthSelect } from '../../components/auth/AuthSelect';
import { AuthStatusBanner } from '../../components/auth/AuthStatusBanner';
import { PasswordRequirements } from '../../components/auth/PasswordRequirements';
import { authService, AuthApiError } from '../../services/authService';
import {
  validateConfirmPassword,
  validateEmail,
  validatePasswordComplexity,
} from '../../utils/authValidation';
import { Branch } from '../../types/prepai';
import { useApp } from '../../context/AppContext';

interface RegisterErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  branch?: string;
  academicYear?: string;
  semester?: string;
  institution?: string;
  acceptedTerms?: string;
}

const BRANCH_OPTIONS = [
  { value: 'CSE', label: 'CSE — Computer Science & Engineering' },
  { value: 'ECE', label: 'ECE — Electronics & Communication' },
  { value: 'EE', label: 'EE — Electrical Engineering' },
  { value: 'ME', label: 'ME — Mechanical Engineering' },
];

const YEAR_OPTIONS = [
  { value: 1, label: '1st Year (Freshman)' },
  { value: 2, label: '2nd Year (Sophomore)' },
  { value: 3, label: '3rd Year (Pre-Final)' },
  { value: 4, label: '4th Year (Final)' },
];

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, idx) => ({
  value: idx + 1,
  label: `Semester ${idx + 1}`,
}));

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [branch, setBranch] = useState<Branch>('CSE');
  const [academicYear, setAcademicYear] = useState<number>(3);
  const [semester, setSemester] = useState<number>(5);
  const [institution, setInstitution] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<RegisterErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (field: keyof RegisterErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleYearChange = (nextYear: number) => {
    setAcademicYear(nextYear);
    clearError('academicYear');
    // Keep semester synchronized with selected year unless user adjusts it explicitly afterwards
    const defaultSemForYear = (nextYear - 1) * 2 + 1;
    setSemester(defaultSemForYear);
    clearError('semester');
  };

  const validate = (): boolean => {
    const nextErrors: RegisterErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      nextErrors.fullName = 'Enter your full name (at least 2 characters).';
    }

    const emailErr = validateEmail(email);
    if (emailErr) nextErrors.email = emailErr;

    const passwordErr = validatePasswordComplexity(password);
    if (passwordErr) nextErrors.password = passwordErr;

    const confirmErr = validateConfirmPassword(password, confirmPassword);
    if (confirmErr) nextErrors.confirmPassword = confirmErr;

    if (!['CSE', 'ECE', 'EE', 'ME'].includes(branch)) {
      nextErrors.branch = 'Select your engineering branch.';
    }

    if (academicYear < 1 || academicYear > 4) {
      nextErrors.academicYear = 'Select a valid academic year (1–4).';
    }

    if (semester < 1 || semester > 8) {
      nextErrors.semester = 'Select a valid semester (1–8).';
    }

    if (!institution.trim() || institution.trim().length < 2) {
      nextErrors.institution = 'College or university name is required.';
    }

    if (!acceptedTerms) {
      nextErrors.acceptedTerms = 'You must accept the terms and conditions to register.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await authService.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        branch,
        academicYear,
        semester,
        institution: institution.trim(),
      });

      const msg =
        res.message ||
        'Registration successful! Please check your email for your verification link.';
      setSuccessMessage(msg);
      showToast('Account created! Verify your email to continue.', 'success');

      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      if (err instanceof AuthApiError) {
        setServerError(err.message);
        if (err.fieldErrors) {
          setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        }
      } else {
        setServerError('An unexpected error occurred during registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Candidate Onboarding"
      sideTitle="Calibrate Your Academic & Technical Track."
      sideSubtitle="Configure your engineering branch, academic standing, and institutional profile to unlock tailored AI cross-examinations and preparation roadmaps."
      headerAction={{
        prompt: 'Already registered?',
        label: 'Sign In',
        to: '/login',
      }}
    >
      <div className="space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-purple-400 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            <span>New Candidate Profile</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create your PrepAI account
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Tailored for B.Tech students across CSE, ECE, EE, and ME disciplines.
          </p>
        </div>

        {serverError && (
          <AuthStatusBanner
            variant="error"
            title="Registration Failed"
            message={serverError}
          />
        )}

        {successMessage && (
          <AuthStatusBanner
            variant="success"
            title="Account Created"
            message={successMessage}
          />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthInput
              id="register-fullname"
              label="Full Name"
              type="text"
              icon={User}
              placeholder="Aarav Sharma"
              autoComplete="name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                clearError('fullName');
              }}
              error={errors.fullName}
              disabled={isSubmitting}
            />

            <AuthInput
              id="register-email"
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@university.edu"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError('email');
              }}
              error={errors.email}
              disabled={isSubmitting}
            />
          </div>

          <AuthInput
            id="register-institution"
            label="College / University Name"
            type="text"
            icon={Building2}
            placeholder="e.g. National Institute of Technology"
            autoComplete="organization"
            value={institution}
            onChange={(e) => {
              setInstitution(e.target.value);
              clearError('institution');
            }}
            error={errors.institution}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AuthSelect
              id="register-branch"
              label="Branch"
              icon={Cpu}
              options={BRANCH_OPTIONS}
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value as Branch);
                clearError('branch');
              }}
              error={errors.branch}
              disabled={isSubmitting}
            />

            <AuthSelect
              id="register-year"
              label="Academic Year"
              icon={Calendar}
              options={YEAR_OPTIONS}
              value={academicYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              error={errors.academicYear}
              disabled={isSubmitting}
            />

            <AuthSelect
              id="register-semester"
              label="Current Semester"
              icon={BookOpen}
              options={SEMESTER_OPTIONS}
              value={semester}
              onChange={(e) => {
                setSemester(Number(e.target.value));
                clearError('semester');
              }}
              error={errors.semester}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthInput
              id="register-password"
              label="Password"
              type="password"
              icon={Lock}
              placeholder="Create a strong password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError('password');
              }}
              error={errors.password}
              disabled={isSubmitting}
            />

            <AuthInput
              id="register-confirm-password"
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError('confirmPassword');
              }}
              error={errors.confirmPassword}
              disabled={isSubmitting}
            />
          </div>

          <div className="rounded-xl bg-[#191B22] border border-white/5 px-3.5 py-2.5">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-gray-500 mb-1">
              Password Security Requirements
            </span>
            <PasswordRequirements password={password} />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="accept-terms"
              className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-gray-300"
            >
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  clearError('acceptedTerms');
                }}
                disabled={isSubmitting}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#191B22] text-[#8b5cf6] focus:ring-[#8b5cf6]/30 focus:ring-offset-0 cursor-pointer accent-[#8b5cf6]"
              />
              <span className="leading-relaxed">
                I agree to the{' '}
                <span className="text-purple-400 font-medium">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-purple-400 font-medium">
                  Academic Integrity & Privacy Policy
                </span>
                .
              </span>
            </label>
            {errors.acceptedTerms && (
              <p className="text-[11px] text-red-400 font-medium">
                {errors.acceptedTerms}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#353946] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>Already have a PrepAI account?</span>
          <NavLink
            to="/login"
            className="font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>Sign in instead</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>
    </AuthLayout>
  );
};
