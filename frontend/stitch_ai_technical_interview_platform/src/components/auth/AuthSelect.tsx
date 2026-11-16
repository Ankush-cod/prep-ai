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
        className="block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#17182B]"
      >
        {label}
      </label>

      <div className="relative group">
        <Icon
          className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
            error
              ? 'text-rose-500'
              : 'text-[#77788B] group-focus-within:text-[#5145E5]'
          }`}
        />
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full appearance-none bg-[#F7F7FC] border rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#17182B] transition-all focus:outline-none focus:bg-white cursor-pointer ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
              : 'border-[#E2E4EB] hover:border-[#CBD0DC] focus:border-[#5145E5] focus:ring-2 focus:ring-[#5145E5]/15'
          }`}
          {...rest}
        >
          {placeholder && (
            <option value="" className="bg-white text-[#77788B]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value} className="bg-white text-[#17182B]">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-[#77788B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {error && (
        <p id={`${id}-error`} className="text-[11px] text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
