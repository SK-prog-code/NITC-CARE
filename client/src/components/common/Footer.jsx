import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              NITC Hostel Management & Grievance System
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              All campus systems operational
            </span>
            <span>Version 1.0.0</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Chief Warden Office, National Institute of Technology Calicut (NITC). Hostel maintenance & grievance coordination.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
