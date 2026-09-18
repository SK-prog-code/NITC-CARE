import React from 'react';
import {
  Clock,
  Eye,
  UserCheck,
  RotateCw,
  CheckCircle2,
  Archive,
  AlertCircle,
} from 'lucide-react';

const statusConfig = {
  submitted: {
    label: 'Submitted',
    icon: Clock,
    classes:
      'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700',
    dotClass: 'bg-slate-500',
  },
  under_review: {
    label: 'Under Review',
    icon: Eye,
    classes:
      'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  assigned: {
    label: 'Assigned',
    icon: UserCheck,
    classes:
      'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    dotClass: 'bg-blue-500',
  },
  in_progress: {
    label: 'In Progress',
    icon: RotateCw,
    classes:
      'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    dotClass: 'bg-indigo-500 animate-spin',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    classes:
      'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  closed: {
    label: 'Closed',
    icon: Archive,
    classes:
      'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    dotClass: 'bg-purple-500',
  },
  reopened: {
    label: 'Reopened',
    icon: AlertCircle,
    classes:
      'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    dotClass: 'bg-rose-500 animate-ping',
  },
};

const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const normalizedStatus = status ? status.toLowerCase() : 'submitted';
  const config = statusConfig[normalizedStatus] || statusConfig.submitted;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${config.classes} ${sizeClasses[size] || sizeClasses.md}`}
    >
      {showIcon && <Icon size={iconSizes[size] || 14} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
