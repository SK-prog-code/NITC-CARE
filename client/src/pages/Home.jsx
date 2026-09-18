import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  Wifi,
  School,
  FlaskConical,
  Building2,
  Wrench,
  Utensils,
  Sparkles,
  ChevronRight,
  Activity,
  Users,
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleQuickAccess = async (role) => {
    const res = await quickLogin(role);
    if (res.success) {
      if (role === 'admin' || role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  };

  const categories = [
    { name: 'Hostel Electrical & Geysers', icon: Zap, desc: 'Fans, tubes, switchboards, geysers, MCB trips in rooms and corridors' },
    { name: 'Plumbing & Sanitation', icon: Building2, desc: 'Taps, flush tanks, washrooms, drains, pipeline leakage' },
    { name: 'Wi‑Fi & LAN Services', icon: Wifi, desc: 'Hostel APs, room LAN ports, switch connectivity and internet stability' },
    { name: 'Housekeeping & Cleanliness', icon: Sparkles, desc: 'Room cleaning, washroom hygiene, waste disposal, corridor upkeep' },
    { name: 'Mess & Food Quality', icon: Utensils, desc: 'Meal quality, hygiene issues, water coolers and dining hall sanitation' },
    { name: 'Furniture & Civil Works', icon: Wrench, desc: 'Beds, tables, doors, locks, ceiling repairs and seepage issues' },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Submit Digitally',
      desc: 'Students report issues with photos, location, category, and suggested priority in under 60 seconds.',
    },
    {
      step: '02',
      title: 'Automated Routing & Triage',
      desc: 'Administrators assign complaints to dedicated department leads with clear SLAs and tracking.',
    },
    {
      step: '03',
      title: 'Transparent Resolution',
      desc: 'Every status update writes an immutable activity log. Students track progress in real time.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 overflow-hidden">
        {/* Glow backdrop decorative bubbles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 to-indigo-500/20 blur-3xl -z-10 rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eef4ff] dark:bg-[#172554]/70 border border-[#c9d8ff] dark:border-[#243b7a] text-[#163c7d] dark:text-[#dfe9ff] text-xs font-semibold mb-6 shadow-sm">
            <ShieldCheck size={14} />
            NIT Calicut Hostel Management & Grievance System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Hostels, Messes & Maintenance{' '}
            <span className="bg-gradient-to-r from-[#0b1d4a] via-[#183d7c] to-[#d3a63f] bg-clip-text text-transparent">
              Managed Digitally
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            NITC residents can report hostel electrical, plumbing, Wi‑Fi, housekeeping, and mess issues in one transparent workflow with faster routing to the right caretaker or department.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'student' ? '/student/dashboard' : '/admin/dashboard'}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-glow hover:shadow-glow-lg transition-all"
              >
                Go to {user?.role === 'student' ? 'Student' : 'Admin'} Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/student/submit"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-glow hover:shadow-glow-lg transition-all"
                >
                  Submit a Complaint
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 font-semibold shadow-sm transition-all"
                >
                  Sign In to Account
                </Link>
              </>
            )}
          </div>

          {/* 1-Click Sandbox Bar on Hero */}
          <div className="mt-12 p-4 max-w-2xl mx-auto glass-card rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" />
                NITC Demo Accounts:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickAccess('student')}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold hover:bg-sky-100 transition"
                >
                  🎓 Student
                </button>
                <button
                  onClick={() => handleQuickAccess('admin')}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition"
                >
                  👑 Warden
                </button>
                <button
                  onClick={() => handleQuickAccess('staff')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
                >
                  🛠️ Caretaker
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights / Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            Structured Workflow
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Hostel Grievance Lifecycle
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workflowSteps.map((step) => (
            <div
              key={step.step}
              className="glass-card relative rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="text-4xl font-extrabold text-brand-600/20 dark:text-brand-400/20 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors font-mono mb-4">
                {step.step}
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {step.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
              Campus Coverage
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Report Any Campus Issue
            </h3>
          </div>
          <Link
            to="/student/submit"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700"
          >
            Submit new complaint <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SLA & Security Trust Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Transparent, Auditable, and Accountable Hostel Administration
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Every hostel complaint, maintenance ticket, and resolution note is permanently logged with timestamps and actor details. No untracked issues, no lost requests across NITC hostels.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-brand-300">15+</p>
                <p className="text-xs text-slate-400 mt-1">Hostels</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-emerald-300">6000+</p>
                <p className="text-xs text-slate-400 mt-1">Residents</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-sky-300">9</p>
                <p className="text-xs text-slate-400 mt-1">Core Maintenance Units</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-purple-300">24/7</p>
                <p className="text-xs text-slate-400 mt-1">Issue Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
