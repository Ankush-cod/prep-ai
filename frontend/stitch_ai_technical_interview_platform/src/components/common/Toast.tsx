// src/components/common/Toast.tsx
import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-purple-400 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1f2026] border border-[#353946] text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      {icons[toast.type || 'success']}
      <span className="text-xs font-medium text-gray-200">{toast.message}</span>
      <button
        onClick={hideToast}
        className="text-gray-400 hover:text-white transition-colors ml-2 p-0.5 rounded"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
