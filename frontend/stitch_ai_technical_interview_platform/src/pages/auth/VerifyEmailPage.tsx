// src/pages/auth/VerifyEmailPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import {
  MailCheck,
  Mail,
  KeyRound,
  Loader2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthStatusBanner } from '../../components/auth/AuthStatusBanner';
import { authService, AuthApiError } from '../../services/authService';
import { validateEmail } from '../../utils/authValidation';
import { useApp } from '../../context/AppContext';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useApp();

  const tokenFromUrl = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [resendEmail, setResendEmail] = useState(emailFromUrl);
  const [tokenError, setTokenError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();

  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>(
    tokenFromUrl ? 'verifying' : 'idle'
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const verifyToken = useCallback(
    async (verificationToken: string) => {
      const trimmed = verificationToken.trim();
      if (!trimmed) {
        setTokenError('Enter a verification token to verify your email.');
        return;
      }

      setStatus('verifying');
      setStatusMessage(null);
      setTokenError(undefined);

      try {
        const res = await authService.verifyEmail({ token: trimmed });
        setStatus('verified');
        setStatusMessage(
          res.message || 'Your email address has been verified. You can now sign in.'
        );
        showToast('Email verified successfully!', 'success');
      } catch (err) {
        setStatus('error');
        if (err instanceof AuthApiError) {
          setStatusMessage(err.message);
        } else {
          setStatusMessage('Unable to verify email token right now.');
        }
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (tokenFromUrl) {
      verifyToken(tokenFromUrl);
    }
  }, [tokenFromUrl, verifyToken]);

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    verifyToken(token);
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendMessage(null);
    setResendError(null);

    const err = validateEmail(resendEmail);
    if (err) {
      setEmailError(err);
      return;
    }

    setIsResending(true);
    try {
      const res = await authService.resendVerification({ email: resendEmail.trim() });
      setResendMessage(
        res.message || 'A new verification email has been sent if the account exists.'
      );
      showToast('Verification email requested.', 'info');
    } catch (error) {
      if (error instanceof AuthApiError) {
        setResendError(error.message);
      } else {
        setResendError('Unable to resend verification email right now.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Email Verification"
      sideTitle="Verify Your Academic Identity."
      sideSubtitle="Confirming your email address secures your PrepAI interview transcripts, resume analyses, and personalized preparation benchmarks."
      headerAction={{
        prompt: 'Already verified?',
        label: 'Sign In',
        to: '/login',
      }}
    >
      <div className="space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#5145E5] uppercase tracking-wider font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>Identity Confirmation</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#17182B]">
            Verify your email address
          </h2>
          <p className="text-xs sm:text-sm text-[#77788B]">
            {tokenFromUrl
              ? 'Processing your email verification token...'
              : 'Check your inbox for a verification link, or submit your token below.'}
          </p>
        </div>

        {/* Status Feedback */}
        {status === 'verifying' && (
          <div className="rounded-xl bg-[#F0EEFF] border border-[#DDD8FE] p-5 flex items-center gap-3 text-xs text-[#5145E5]">
            <Loader2 className="w-5 h-5 text-[#5145E5] animate-spin shrink-0" />
            <div>
              <p className="font-semibold text-[#17182B]">Verifying Token...</p>
              <p className="text-[#77788B] mt-0.5">
                Validating your verification token with the PrepAI server.
              </p>
            </div>
          </div>
        )}

        {status === 'verified' && statusMessage && (
          <div className="space-y-4">
            <AuthStatusBanner
              variant="success"
              title="Email Verified"
              message={statusMessage}
            />
            <NavLink
              to="/login"
              className="w-full py-2.5 px-4 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] text-white text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Proceed to Login</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        )}

        {status === 'error' && statusMessage && (
          <AuthStatusBanner
            variant="error"
            title="Verification Failed"
            message={statusMessage}
          />
        )}

        {status === 'idle' && emailFromUrl && (
          <AuthStatusBanner
            variant="info"
            title="Verification Email Sent"
            message={`We prepared a verification step for ${emailFromUrl}. Open the link in your email or paste the verification token below.`}
          />
        )}

        {/* Manual Token Verification Form */}
        {status !== 'verified' && (
          <form onSubmit={handleManualVerify} noValidate className="space-y-3">
            <AuthInput
              id="verify-token"
              label="Verification Token"
              type="text"
              icon={KeyRound}
              mono
              placeholder="Paste verification token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (tokenError) setTokenError(undefined);
              }}
              error={tokenError}
              disabled={status === 'verifying'}
            />

            <button
              type="submit"
              disabled={status === 'verifying'}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5145E5] hover:bg-[#4338CA] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {status === 'verifying' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <MailCheck className="w-4 h-4" />
                  <span>Verify Email Token</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Resend Verification Section */}
        {status !== 'verified' && (
          <div className="pt-4 border-t border-[#E2E4EB] space-y-3">
            <p className="text-xs font-semibold text-[#17182B]">
              Didn&apos;t receive the verification email?
            </p>

            {resendError && (
              <AuthStatusBanner
                variant="error"
                title="Resend Failed"
                message={resendError}
              />
            )}

            {resendMessage && (
              <AuthStatusBanner
                variant="success"
                title="Request Sent"
                message={resendMessage}
              />
            )}

            <form onSubmit={handleResend} noValidate className="space-y-3">
              <AuthInput
                id="resend-email"
                label="Account Email"
                type="email"
                icon={Mail}
                placeholder="you@university.edu"
                autoComplete="email"
                value={resendEmail}
                onChange={(e) => {
                  setResendEmail(e.target.value);
                  if (emailError) setEmailError(undefined);
                }}
                error={emailError}
                disabled={isResending}
              />

              <button
                type="submit"
                disabled={isResending}
                className="w-full py-2 px-4 rounded-xl bg-white hover:bg-[#F7F7FC] border border-[#E2E4EB] hover:border-[#5145E5]/40 disabled:opacity-60 text-xs font-semibold text-[#17182B] transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resending Email...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#5145E5]" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="pt-4 border-t border-[#E2E4EB] flex flex-wrap items-center justify-between gap-3 text-xs">
          <NavLink
            to="/login"
            className="text-[#77788B] hover:text-[#17182B] transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </NavLink>

          <NavLink
            to="/register"
            className="font-semibold text-[#5145E5] hover:text-[#4338CA] transition-colors"
          >
            Register a different email
          </NavLink>
        </div>
      </div>
    </AuthLayout>
  );
};
