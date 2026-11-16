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
          className="block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#17182B]"
        >
          {label}
        </label>
        {rightAction}
      </div>

      <div className="relative group">
        <Icon
          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
            error
              ? 'text-rose-500'
              : 'text-[#77788B] group-focus-within:text-[#5145E5]'
          }`}
        />
        <input
          id={id}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`w-full bg-[#F7F7FC] border rounded-xl pl-10 ${
            isPassword ? 'pr-10' : 'pr-3.5'
          } py-2.5 text-xs sm:text-sm text-[#17182B] placeholder:text-[#9DA0B3] transition-all focus:outline-none focus:bg-white ${
            mono ? 'font-mono' : 'font-sans'
          } ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
              : 'border-[#E2E4EB] hover:border-[#CBD0DC] focus:border-[#5145E5] focus:ring-2 focus:ring-[#5145E5]/15'
          }`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#77788B] hover:text-[#17182B] hover:bg-black/5 transition-colors"
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
        <p id={`${id}-error`} className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[11px] text-[#77788B]">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
