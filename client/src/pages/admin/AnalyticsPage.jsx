import React, { useState, useEffect } from 'react';
import { statsService } from '../../services/api';
import {
  BarChart3,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Building2,
  Loader2,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const AnalyticsPage = () => {
  const [resolutionStats, setResolutionStats] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [catStats, setCatStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [resTime, depts, cats, sum] = await Promise.all([
          statsService.getResolutionTime(),
          statsService.getByDepartment(),
          statsService.getByCategory(),
          statsService.getSummary(),
        ]);

        if (resTime.success) setResolutionStats(resTime.data);
        if (depts.success) setDeptStats(depts.data);
        if (cats.success) setCatStats(cats.data);
        if (sum.success) setSummary(sum.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-3" />
        <p className="text-sm">Calculating campus SLA & resolution performance...</p>
      </div>
    );
  }

  const priorityData = resolutionStats?.avgByPriority || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-2">
            📊 Executive Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Grievance Resolution & SLA Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track average turnaround times, department workload distribution, and resolution performance
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm transition flex items-center gap-1.5 self-start sm:self-center"
        >
          <Download size={15} /> Export / Print Report
        </button>
      </div>

      {/* SLA Resolution Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {priorityData.map((p) => {
          const badgeColors = {
            critical: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
            high: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
            medium: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
            low: 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          };

          return (
            <div
              key={p.priority}
              className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${badgeColors[p.priority] || badgeColors.low}`}
                >
                  {p.priority} Priority
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {p.count} resolved
                </span>
              </div>

              <div className="pt-2">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {p.avgHours > 0 ? `${p.avgHours} hrs` : 'N/A'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {p.avgDays > 0 ? `(~${p.avgDays} calendar days)` : 'No closed sample yet'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Workload Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Department Volume vs Resolved Bar Chart */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Department Load & Resolution Output
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total assigned complaints vs. successfully resolved count
            </p>
          </div>

          <div className="h-72">
            {deptStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="name"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar name="Total Assigned" dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar name="Resolved" dataKey="resolvedCount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No department data available
              </div>
            )}
          </div>
        </div>

        {/* Category Share List */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Category Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Campus grievance volume breakdown
            </p>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto pr-1">
            {catStats.map((c) => {
              const total = summary?.total || 1;
              const pct = Math.round((c.count / total) * 100);

              return (
                <div key={c._id} className="pt-2.5 first:pt-0">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.name}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {c.count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
