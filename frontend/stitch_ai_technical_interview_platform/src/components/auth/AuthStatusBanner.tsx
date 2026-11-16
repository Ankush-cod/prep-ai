// src/components/auth/AuthStatusBanner.tsx
import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AuthStatusBannerProps {
  variant: 'error' | 'success' | 'info';
  title?: string;
  message: string;
}

export const AuthStatusBanner: React.FC<AuthStatusBannerProps> = ({
  variant,
  title,
  message,
}) => {
  const styles = {
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
      title: 'text-rose-950',
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
      title: 'text-emerald-950',
    },
    info: {
      container: 'bg-[#F0EEFF] border-[#DDD8FE] text-indigo-900',
      icon: <Info className="w-4 h-4 text-[#5145E5] shrink-0 mt-0.5" />,
      title: 'text-indigo-950',
    },
  }[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border px-4 py-3 flex items-start gap-3 text-xs leading-relaxed ${styles.container}`}
    >
      {styles.icon}
      <div className="space-y-0.5">
        {title && (
          <p className={`font-semibold ${styles.title}`}>{title}</p>
        )}
        <p className="opacity-95">{message}</p>
      </div>
    </div>
  );
};
