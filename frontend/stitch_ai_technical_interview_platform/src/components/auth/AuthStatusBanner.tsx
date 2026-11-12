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
      container: 'bg-red-500/10 border-red-500/30 text-red-200',
      icon: <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />,
      title: 'text-red-300',
    },
    success: {
      container: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
      title: 'text-emerald-300',
    },
    info: {
      container: 'bg-purple-500/10 border-purple-500/30 text-purple-200',
      icon: <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />,
      title: 'text-purple-300',
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
        <p className="text-gray-200/90">{message}</p>
      </div>
    </div>
  );
};
