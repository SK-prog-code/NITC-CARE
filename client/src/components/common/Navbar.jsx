import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldCheck,
  Sun,
  Moon,
  PlusCircle,
  LayoutDashboard,
  FileText,
  Layers,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isStaff, isStudent } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold shadow-sm'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0b1d4a] via-[#1d3a6b] to-[#d3a63f] flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                NITC CARE
              </span>
              <span className="block text-[10px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-300 -mt-1">
                Hostels & Grievance Cell
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                {/* Student Links */}
                {isStudent && (
                  <>
                    <NavLink to="/student/dashboard" className={navLinkClass}>
                      <LayoutDashboard size={16} />
                      Dashboard
                    </NavLink>
                    <NavLink to="/student/complaints" className={navLinkClass}>
                      <FileText size={16} />
                      My Complaints
                    </NavLink>
                    <NavLink
                      to="/student/submit"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-glow hover:shadow-glow-lg transition-all ml-1"
                    >
                      <PlusCircle size={16} />
                      Submit Complaint
                    </NavLink>
                  </>
                )}

                {/* Admin & Staff Links */}
                {(isAdmin || isStaff) && (
                  <>
                    <NavLink to="/admin/dashboard" className={navLinkClass}>
                      <LayoutDashboard size={16} />
                      Overview
                    </NavLink>
                    <NavLink to="/admin/complaints" className={navLinkClass}>
                      <FileText size={16} />
                      All Complaints
                    </NavLink>
                    {isAdmin && (
                      <>
                        <NavLink to="/admin/management" className={navLinkClass}>
                          <Layers size={16} />
                          Categories & Depts
                        </NavLink>
                        <NavLink to="/admin/analytics" className={navLinkClass}>
                          <BarChart3 size={16} />
                          Analytics
                        </NavLink>
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <NavLink to="/" className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
                >
                  Student Sign Up
                </NavLink>
              </>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Authenticated User Menu */}
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl glass-card shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.rollNumber && (
                        <p className="text-[10px] text-brand-600 dark:text-brand-400 font-mono mt-0.5">
                          Roll: {user.rollNumber}
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      {isStudent && (
                        <>
                          <Link
                            to="/student/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <LayoutDashboard size={14} /> Dashboard
                          </Link>
                          <Link
                            to="/student/complaints"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <FileText size={14} /> My Complaints
                          </Link>
                        </>
                      )}

                      {(isAdmin || isStaff) && (
                        <>
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <LayoutDashboard size={14} /> Admin Overview
                          </Link>
                          <Link
                            to="/admin/complaints"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <FileText size={14} /> Complaint Management
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              {isStudent && (
                <>
                  <NavLink
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </NavLink>
                  <NavLink
                    to="/student/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass}
                  >
                    <FileText size={16} /> My Complaints
                  </NavLink>
                  <NavLink
                    to="/student/submit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white"
                  >
                    <PlusCircle size={16} /> Submit Complaint
                  </NavLink>
                </>
              )}

              {(isAdmin || isStaff) && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass}
                  >
                    <LayoutDashboard size={16} /> Overview
                  </NavLink>
                  <NavLink
                    to="/admin/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass}
                  >
                    <FileText size={16} /> All Complaints
                  </NavLink>
                  {isAdmin && (
                    <>
                      <NavLink
                        to="/admin/management"
                        onClick={() => setMobileMenuOpen(false)}
                        className={navLinkClass}
                      >
                        <Layers size={16} /> Categories & Departments
                      </NavLink>
                      <NavLink
                        to="/admin/analytics"
                        onClick={() => setMobileMenuOpen(false)}
                        className={navLinkClass}
                      >
                        <BarChart3 size={16} /> Analytics & Reports
                      </NavLink>
                    </>
                  )}
                </>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
