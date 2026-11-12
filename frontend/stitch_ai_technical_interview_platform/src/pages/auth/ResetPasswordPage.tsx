// src/pages/auth/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthStatusBanner } from '../../components/auth/AuthStatusBanner';
import { PasswordRequirements } from '../../components/auth/PasswordRequirements';
import { authService, AuthApiError } from '../../services/authService';
import {
  validateConfirmPassword,
  validatePasswordComplexity,
} from '../../utils/authValidation';
import { useApp } from '../../context/AppContext';

interface ResetErrors {
  token?: string;
  password?: string;
  confirmPassword?: string;
}

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const initialToken = searchParams.get('token') || '';
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<ResetErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: ResetErrors = {};

    if (!token.trim()) {
      nextErrors.token = 'A valid password reset token is required.';
    }

    const passwordErr = validatePasswordComplexity(password);
    if (passwordErr) nextErrors.password = passwordErr;

    const confirmErr = validateConfirmPassword(password, confirmPassword);
    if (confirmErr) nextErrors.confirmPassword = confirmErr;

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
      const res = await authService.resetPassword({
        token: token.trim(),
        password,
      });

      const msg =
        res.message ||
        'Your password has been reset successfully. You can now sign in.';
      setSuccessMessage(msg);
      showToast('Password updated successfully.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      if (error instanceof AuthApiError) {
        setServerError(error.message);
      } else {
        setServerError('Unable to reset password right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Credential Reset"
      sideTitle="Set a New Encrypted Credential."
      sideSubtitle="Choose a strong password for your PrepAI account. Once updated, all active sessions can be re-authenticated with your new password."
      headerAction={{
        prompt: 'Back to sign in?',
        label: 'Login',
        to: '/login',
      }}
    >
      <div className="space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-purple-400 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            <span>Token-Verified Reset</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Reset your password
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Enter a new password to regain access to your account.
          </p>
        </div>

        {!initialToken && !serverError && !successMessage && (
          <AuthStatusBanner
            variant="info"
            title="Reset Token Required"
            message="Paste the reset token from your recovery email or open the complete link sent to your inbox."
          />
        )}

        {serverError && (
          <AuthStatusBanner
            variant="error"
            title="Password Reset Failed"
            message={serverError}
          />
        )}

        {successMessage && (
          <AuthStatusBanner
            variant="success"
            title="Password Updated"
            message={successMessage}
          />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {!initialToken && (
            <AuthInput
              id="reset-token"
              label="Reset Token"
              type="text"
              icon={KeyRound}
              mono
              placeholder="Paste token from recovery email"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (errors.token) setErrors((prev) => ({ ...prev, token: undefined }));
              }}
              error={errors.token}
              disabled={isSubmitting}
            />
          )}

          <AuthInput
            id="reset-password"
            label="New Password"
            type="password"
            icon={Lock}
            placeholder="Enter new password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            disabled={isSubmitting}
          />

          <AuthInput
            id="reset-confirm-password"
            label="Confirm New Password"
            type="password"
            icon={Lock}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            error={errors.confirmPassword}
            disabled={isSubmitting}
          />

          <div className="rounded-xl bg-[#191B22] border border-white/5 px-3.5 py-2.5">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-gray-500 mb-1">
              Password Security Requirements
            </span>
            <PasswordRequirements password={password} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#353946] flex flex-wrap items-center justify-between gap-3 text-xs">
          <NavLink
            to="/login"
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </NavLink>

          <NavLink
            to="/forgot-password"
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Request a new reset link
          </NavLink>
        </div>
      </div>
    </AuthLayout>
  );
};
