import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import {
  FileText,
  Clock,
  RotateCw,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaints({ limit: 5 });
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) =>
    ['submitted', 'under_review'].includes(c.status)
  ).length;
  const inProgressCount = complaints.filter((c) =>
    ['assigned', 'in_progress'].includes(c.status)
  ).length;
  const resolvedCount = complaints.filter((c) =>
    ['resolved', 'closed'].includes(c.status)
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm mb-3">
              🎓 Student Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-slate-200 text-sm mt-2 max-w-xl">
              Track the status of your reported campus grievances or submit a new ticket for immediate assistance.
            </p>
          </div>

          <Link
            to="/student/submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-brand-700 hover:bg-slate-100 font-bold text-sm shadow-lg hover:shadow-xl transition-all shrink-0"
          >
            <PlusCircle size={18} />
            Submit New Complaint
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Submitted"
          value={totalCount}
          icon={FileText}
          color="indigo"
          subtitle="All complaints filed by you"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={Clock}
          color="amber"
          subtitle="Awaiting triage & assignment"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={RotateCw}
          color="blue"
          subtitle="Currently being resolved"
        />
        <StatCard
          title="Resolved / Closed"
          value={resolvedCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully addressed"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Complaints
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your latest submitted campus grievance tickets
            </p>
          </div>
          <Link
            to="/student/complaints"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
          >
            View All My Complaints <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading recent complaints...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm">No complaints submitted yet</p>
            <p className="text-xs mt-1 text-slate-400 max-w-sm mx-auto">
              If you notice any broken infrastructure, Wi-Fi issues, or facility problems, submit your first ticket.
            </p>
            <Link
              to="/student/submit"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle size={14} /> Submit Complaint
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 -mx-4 px-4 rounded-xl transition"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">
                      {c.complaintCode}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                    <PriorityBadge priority={c.priority} size="sm" />
                  </div>

                  <Link
                    to={`/student/complaints/${c._id}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block truncate"
                  >
                    {c.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {c.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />{' '}
                      {c.createdAt ? format(new Date(c.createdAt), 'MMM d, yyyy') : ''}
                    </span>
                    {c.assignedDepartmentId && (
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        Dept: {c.assignedDepartmentId.name}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/student/complaints/${c._id}`}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition shrink-0 flex items-center gap-1.5 self-start sm:self-center"
                >
                  View Details <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
