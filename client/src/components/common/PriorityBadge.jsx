import React from 'react';
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from 'lucide-react';

const priorityConfig = {
  low: {
    label: 'Low',
    icon: ArrowDown,
    classes:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
    dotClass: 'bg-slate-400',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    classes:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    dotClass: 'bg-blue-500',
  },
  high: {
    label: 'High',
    icon: ArrowUp,
    classes:
      'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/60',
    dotClass: 'bg-amber-500',
  },
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    classes:
      'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-700 font-semibold shadow-glow animate-pulse',
    dotClass: 'bg-rose-600',
  },
};

const PriorityBadge = ({ priority, size = 'md', showIcon = true }) => {
  const normalizedPriority = priority ? priority.toLowerCase() : 'medium';
  const config = priorityConfig[normalizedPriority] || priorityConfig.medium;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${config.classes} ${sizeClasses[size] || sizeClasses.md}`}
    >
      {showIcon && <Icon size={size === 'sm' ? 12 : 14} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};

export default PriorityBadge;
