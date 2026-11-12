// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, KeyRound, Loader2, ArrowLeft, ArrowRight, Terminal } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthStatusBanner } from '../../components/auth/AuthStatusBanner';
import { authService, AuthApiError } from '../../services/authService';
import { validateEmail } from '../../utils/authValidation';
import { useApp } from '../../context/AppContext';

export const ForgotPasswordPage: React.FC = () => {
  const { showToast } = useApp();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword({ email: email.trim() });
      const msg =
        res.message ||
        'If an account matches this email, password reset instructions have been sent.';
      setSuccessMessage(msg);
      showToast('Password reset request submitted.', 'info');
    } catch (error) {
      if (error instanceof AuthApiError) {
        setServerError(error.message);
      } else {
        setServerError('Unable to send password reset instructions right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Credential Recovery"
      sideTitle="Recover Access to Your PrepAI Workspace."
      sideSubtitle="Enter the email address associated with your PrepAI account and we will dispatch a time-limited password reset token."
      headerAction={{
        prompt: 'Remembered your password?',
        label: 'Sign In',
        to: '/login',
      }}
    >
      <div className="space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-purple-400 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            <span>Password Recovery Protocol</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Forgot your password?
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Provide your registered email address to receive a recovery link.
          </p>
        </div>

        {serverError && (
          <AuthStatusBanner
            variant="error"
            title="Recovery Request Failed"
            message={serverError}
          />
        )}

        {successMessage && (
          <AuthStatusBanner
            variant="success"
            title="Reset Instructions Dispatched"
            message={successMessage}
          />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthInput
            id="forgot-email"
            label="Registered Email Address"
            type="email"
            icon={Mail}
            placeholder="you@university.edu"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(undefined);
            }}
            error={emailError}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Recovery Link...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Send Reset Link</span>
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
            to="/reset-password"
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Already have a reset token?
          </NavLink>
        </div>
      </div>
    </AuthLayout>
  );
};
