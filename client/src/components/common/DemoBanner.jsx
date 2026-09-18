import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Zap, Shield, Wrench, GraduationCap, LogOut, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DemoBanner = () => {
  const { user, quickLogin, logout, isAuthenticated } = useAuth();
  const [switchingRole, setSwitchingRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSwitch = async (role) => {
    setSwitchingRole(role);
    const result = await quickLogin(role);
    setSwitchingRole(null);
    if (result.success) {
      if (role === 'admin' || role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs py-2 px-4 border-b border-indigo-900/50 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            <Zap size={13} className="text-amber-400" />
            NITC Demo Access:
          </span>
          {isAuthenticated && user && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-200 border border-indigo-700/50">
              Logged in as: <strong className="text-white capitalize">{user.role}</strong> ({user.name.split(' ')[0]})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-slate-400 text-[11px] hidden md:inline">
            1-Click Switch:
          </span>

          <button
            onClick={() => handleRoleSwitch('admin')}
            disabled={switchingRole !== null}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              user?.role === 'admin'
                ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            <Shield size={12} className="text-purple-400" />
            Chief Warden
            {user?.role === 'admin' && <Check size={11} className="ml-0.5" />}
          </button>

          <button
            onClick={() => handleRoleSwitch('staff')}
            disabled={switchingRole !== null}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              user?.role === 'staff'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            <Wrench size={12} className="text-emerald-400" />
            Caretaker
            {user?.role === 'staff' && <Check size={11} className="ml-0.5" />}
          </button>

          <button
            onClick={() => handleRoleSwitch('student')}
            disabled={switchingRole !== null}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              user?.role === 'student'
                ? 'bg-sky-600 text-white ring-2 ring-sky-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            <GraduationCap size={12} className="text-sky-400" />
            Student
            {user?.role === 'student' && <Check size={11} className="ml-0.5" />}
          </button>

          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/50 transition-colors ml-1"
              title="Logout"
            >
              <LogOut size={11} />
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
