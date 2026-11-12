// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, ArrowRight, Terminal } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthStatusBanner } from '../../components/auth/AuthStatusBanner';
import { authService, AuthApiError } from '../../services/authService';
import { validateEmail } from '../../utils/authValidation';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface LoginErrors {
  email?: string;
  password?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { setAuthenticatedUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: LoginErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) nextErrors.email = emailErr;
    if (!password) {
      nextErrors.password = 'Password is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await authService.login({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (res.user) {
        setAuthenticatedUser(res.user);
      }
      showToast(res.message || 'Authenticated successfully.', 'success');
      if (res.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof AuthApiError) {
        setServerError(err.message);
        if (err.fieldErrors) {
          setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
        }
      } else {
        setServerError('An unexpected error occurred while signing in.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Auth Gateway"
      sideTitle="Resume Your Technical Interview Calibration."
      sideSubtitle="Sign in to access your AI mock interview rooms, branch-specific preparation library, sandboxed coding practice, and diagnostic telemetry."
      headerAction={{
        prompt: 'New to PrepAI?',
        label: 'Create Account',
        to: '/register',
      }}
    >
      <div className="space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] text-purple-400 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5" />
            <span>Session Authentication</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Sign in to PrepAI
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Enter your academic or registered credentials to continue.
          </p>
        </div>

        {serverError && (
          <AuthStatusBanner
            variant="error"
            title="Authentication Failed"
            message={serverError}
          />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthInput
            id="login-email"
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="you@university.edu"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            disabled={isSubmitting}
          />

          <AuthInput
            id="login-password"
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            disabled={isSubmitting}
            rightAction={
              <NavLink
                to="/forgot-password"
                className="text-[11px] font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </NavLink>
            }
          />

          <div className="flex items-center justify-between pt-1">
            <label
              htmlFor="remember-me"
              className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-gray-300"
            >
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
                className="w-4 h-4 rounded border-white/20 bg-[#191B22] text-[#8b5cf6] focus:ring-[#8b5cf6]/30 focus:ring-offset-0 cursor-pointer accent-[#8b5cf6]"
              />
              <span>Remember me on this device</span>
            </label>

            <NavLink
              to="/verify-email"
              className="text-[11px] font-mono text-gray-400 hover:text-purple-300 transition-colors"
            >
              Verify email
            </NavLink>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#353946] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>Don&apos;t have a PrepAI account yet?</span>
          <NavLink
            to="/register"
            className="font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <span>Create your engineering profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>
    </AuthLayout>
  );
};
