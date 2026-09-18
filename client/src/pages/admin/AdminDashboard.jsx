import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsService, complaintService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import {
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  BarChart2,
  ArrowRight,
  TrendingUp,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [priorityStats, setPriorityStats] = useState([]);
  const [hostelStats, setHostelStats] = useState([]);
  const [urgentComplaints, setUrgentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [sumRes, catRes, deptRes, priRes, hostelRes, urgentRes] = await Promise.all([
          statsService.getSummary(),
          statsService.getByCategory(),
          statsService.getByDepartment(),
          statsService.getByPriority(),
          statsService.getByHostel(),
          complaintService.getComplaints({
            priority: 'critical',
            limit: 5,
            sortOrder: 'desc',
          }),
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (catRes.success) setCategoryStats(catRes.data);
        if (deptRes.success) setDepartmentStats(deptRes.data);
        if (priRes.success) setPriorityStats(priRes.data);
        if (hostelRes.success) setHostelStats(hostelRes.data);
        if (urgentRes.success) setUrgentComplaints(urgentRes.data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
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
        <p className="text-sm">Aggregating campus grievance metrics...</p>
      </div>
    );
  }

  const statusData = summary
    ? [
        { name: 'Submitted', value: summary.submitted || 0, color: '#94a3b8' },
        { name: 'Under Review', value: summary.underReview || 0, color: '#f59e0b' },
        { name: 'Assigned', value: summary.assigned || 0, color: '#3b82f6' },
        { name: 'In Progress', value: summary.inProgress || 0, color: '#6366f1' },
        { name: 'Resolved', value: summary.resolved || 0, color: '#10b981' },
        { name: 'Closed', value: summary.closed || 0, color: '#8b5cf6' },
        { name: 'Reopened', value: summary.reopened || 0, color: '#ef4444' },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
            👑 Chief Administrator Control Room
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Campus Grievance & SLA Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time operational overview across all departments, categories, and resolution stages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-glow transition flex items-center gap-1.5"
          >
            <FileText size={15} /> All Complaints Table
          </Link>
          <Link
            to="/admin/management"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Layers size={15} /> Manage Categories
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Complaints"
          value={summary?.total || 0}
          icon={FileText}
          color="indigo"
          subtitle="Cumulative tickets logged"
        />
        <StatCard
          title="Pending Review"
          value={summary?.pending || 0}
          icon={Clock}
          color="amber"
          subtitle="Requires triage & routing"
        />
        <StatCard
          title="Resolution Rate"
          value={`${summary?.resolutionRate || 0}%`}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${summary?.completed || 0} of ${summary?.total || 0} resolved`}
        />
        <StatCard
          title="Avg Resolution Time"
          value={`${summary?.avgResolutionDays || 0} d`}
          icon={TrendingUp}
          color="blue"
          subtitle={`~${summary?.avgResolutionHours || 0} operating hours`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status Distribution Donut Chart */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Status Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active tickets by lifecycle stage
            </p>
          </div>

          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Complaints by Category Bar Chart */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Complaints by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Campus grievance volume breakdown
            </p>
          </div>

          <div className="h-64">
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hostel Load Distribution */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Hostel Block Load Distribution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complaint concentration by NITC hostel block for caretaker prioritization
          </p>
        </div>

        <div className="h-72">
          {hostelStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hostelStats} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis
                  dataKey="hostelBlock"
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
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No hostel block data available
            </div>
          )}
        </div>
      </div>

      {/* Urgent Critical Priority Attention Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={18} />
              Critical Attention & Safety Hazards
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-priority campus issues requiring immediate administrative intervention
            </p>
          </div>
          <Link
            to="/admin/complaints?priority=critical"
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            View All Critical ({summary?.critical || 0}) <ArrowRight size={13} />
          </Link>
        </div>

        {urgentComplaints.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            🎉 No critical priority emergencies currently pending.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {urgentComplaints.map((c) => (
              <div
                key={c._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 -mx-3 px-3 rounded-xl transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                      {c.complaintCode}
                    </span>
                    <PriorityBadge priority={c.priority} size="sm" />
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <Link
                    to={`/admin/complaints/${c._id}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Location: {c.location} · Student: {c.studentId?.name}
                  </p>
                </div>

                <Link
                  to={`/admin/complaints/${c._id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition shrink-0 self-start sm:self-center"
                >
                  Manage Ticket
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
