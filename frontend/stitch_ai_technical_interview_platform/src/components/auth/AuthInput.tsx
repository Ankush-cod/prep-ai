// src/components/auth/AuthInput.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
  rightAction?: React.ReactNode;
  mono?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  id,
  label,
  icon: Icon,
  type = 'text',
  error,
  hint,
  rightAction,
  mono = false,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400"
        >
          {label}
        </label>
        {rightAction}
      </div>

      <div className="relative group">
        <Icon
          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
            error
              ? 'text-red-400'
              : 'text-gray-500 group-focus-within:text-purple-400'
          }`}
        />
        <input
          id={id}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`w-full bg-[#191B22] border rounded-xl pl-10 ${
            isPassword ? 'pr-10' : 'pr-3.5'
          } py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-600 transition-all focus:outline-none ${
            mono ? 'font-mono' : 'font-sans'
          } ${
            error
              ? 'border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/15'
              : 'border-[#353946] hover:border-white/20 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20'
          }`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-[11px] text-red-400 font-medium flex items-center gap-1">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[11px] text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
