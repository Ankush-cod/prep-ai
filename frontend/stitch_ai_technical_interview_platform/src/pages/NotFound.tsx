// src/pages/NotFound.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#191B22] flex flex-col items-center justify-center p-6 text-center text-[#e3e2e8]">
      <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 mb-6 shadow-xl shadow-purple-600/20">
        <Zap className="w-8 h-8 fill-current" />
      </div>

      <span className="font-mono text-xs uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 mb-3">
        404 // ROUTE_NOT_FOUND
      </span>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
        Telemetric Endpoint Missing
      </h1>

      <p className="text-sm text-gray-400 max-w-md mb-8 leading-relaxed">
        The requested platform path or evaluation module does not exist in the current PrepAI v2.4 routing hierarchy.
      </p>

      <div className="flex items-center gap-4">
        <NavLink
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </NavLink>
        <NavLink
          to="/"
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#353946] text-gray-300 font-medium text-xs flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Public Landing</span>
        </NavLink>
      </div>
    </div>
  );
};
