// src/components/auth/PasswordRequirements.tsx
import React from 'react';
import { Check, Circle } from 'lucide-react';
import { getPasswordChecks } from '../../utils/authValidation';

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
}) => {
  const checks = getPasswordChecks(password);

  const rules = [
    { label: '8+ characters', met: checks.minLength },
    { label: 'Uppercase letter', met: checks.hasUppercase },
    { label: 'Lowercase letter', met: checks.hasLowercase },
    { label: 'Number', met: checks.hasNumber },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 pt-1">
      {rules.map((rule) => (
        <div
          key={rule.label}
          className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors ${
            rule.met ? 'text-emerald-600 font-semibold' : 'text-[#9DA0B3]'
          }`}
        >
          {rule.met ? (
            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
          ) : (
            <Circle className="w-2.5 h-2.5 text-[#CBD0DC] shrink-0" />
          )}
          <span>{rule.label}</span>
        </div>
      ))}
    </div>
  );
};
