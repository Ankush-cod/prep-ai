// src/components/auth/AuthSelect.tsx
import React from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface AuthSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  id: string;
  label: string;
  icon: LucideIcon;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const AuthSelect: React.FC<AuthSelectProps> = ({
  id,
  label,
  icon: Icon,
  options,
  placeholder,
  error,
  ...rest
}) => {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400"
      >
        {label}
      </label>

      <div className="relative group">
        <Icon
          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
            error
              ? 'text-red-400'
              : 'text-gray-500 group-focus-within:text-purple-400'
          }`}
        />
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full appearance-none bg-[#191B22] border rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white transition-all focus:outline-none cursor-pointer ${
            error
              ? 'border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/15'
              : 'border-[#353946] hover:border-white/20 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20'
          }`}
          {...rest}
        >
          {placeholder && (
            <option value="" className="bg-[#20232C] text-gray-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#20232C] text-gray-100"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {error && (
        <p id={`${id}-error`} className="text-[11px] text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
