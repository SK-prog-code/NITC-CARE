import React from 'react';
import { format } from 'date-fns';
import {
  FileText,
  CheckCircle2,
  Clock,
  UserCheck,
  MessageSquare,
  AlertCircle,
  Archive,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const actionIcons = {
  submitted: { icon: FileText, color: 'bg-blue-500 text-white' },
  status_changed: { icon: RefreshCw, color: 'bg-indigo-500 text-white' },
  assigned: { icon: UserCheck, color: 'bg-purple-500 text-white' },
  comment_added: { icon: MessageSquare, color: 'bg-amber-500 text-white' },
  priority_changed: { icon: AlertCircle, color: 'bg-orange-500 text-white' },
  resolved: { icon: CheckCircle2, color: 'bg-emerald-500 text-white' },
  closed: { icon: Archive, color: 'bg-slate-600 text-white' },
  reopened: { icon: AlertCircle, color: 'bg-rose-500 text-white' },
};

const roleStyles = {
  student: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  staff: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  system: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const ActivityTimeline = ({ activityLog = [] }) => {
  if (!activityLog || activityLog.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 dark:text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No activity recorded yet.</p>
      </div>
    );
  }

  // Sort chronological (earliest to latest)
  const sortedLogs = [...activityLog].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {sortedLogs.map((log, index) => {
        const actionConfig = actionIcons[log.action] || actionIcons.status_changed;
        const Icon = actionConfig.icon;
        const actorRole = log.actorRole || (log.actorId?.role) || 'system';
        const actorName = log.actorName || (log.actorId?.name) || 'Campus Staff';
        const formattedDate = log.createdAt
          ? format(new Date(log.createdAt), 'MMM d, yyyy · h:mm a')
          : 'Just now';

        return (
          <div key={log._id || index} className="relative group">
            {/* Timeline icon node */}
            <div
              className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${actionConfig.color} ring-4 ring-white dark:ring-slate-900`}
            >
              <Icon size={13} />
            </div>

            {/* Content card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {actorName}
                  </span>
                  <span
                    className={`text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      roleStyles[actorRole.toLowerCase()] || roleStyles.system
                    }`}
                  >
                    {actorRole}
                  </span>
                </div>
                <time className="text-xs text-slate-500 dark:text-slate-400">
                  {formattedDate}
                </time>
              </div>

              {/* Status Transition visualization if status changed */}
              {log.action === 'status_changed' && log.oldValue && log.newValue && (
                <div className="flex items-center gap-2 my-2 py-1 px-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
                  <StatusBadge status={log.oldValue} size="sm" />
                  <ArrowRight size={13} className="text-slate-400 shrink-0" />
                  <StatusBadge status={log.newValue} size="sm" />
                </div>
              )}

              {/* Notes / Comments body */}
              {log.note && (
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                  {log.note}
                </p>
              )}

              {/* Special highlighting for resolution */}
              {log.action === 'resolved' && (
                <div className="mt-2.5 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Resolution Summary
                  </p>
                  <p className="text-sm text-emerald-950 dark:text-emerald-200">
                    {log.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
