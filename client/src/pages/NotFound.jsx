import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-sm">
        <ShieldCheck size={32} />
      </div>
      <h1 className="text-6xl font-extrabold text-slate-900 dark:text-white font-mono">
        404
      </h1>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-2">
        Page Not Found
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-6">
        The grievance page or resource you are looking for might have been moved or does not exist.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-glow transition flex items-center gap-2"
      >
        <ArrowLeft size={14} /> Back to Campus Home
      </Link>
    </div>
  );
};

export default NotFound;
