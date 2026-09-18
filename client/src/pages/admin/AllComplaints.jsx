import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  complaintService,
  categoryService,
  departmentService,
  authService,
} from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Eye,
  Calendar,
  MapPin,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

const AllComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'all');
  const [departmentFilter, setDepartmentFilter] = useState(searchParams.get('department') || 'all');
  const [hostelBlockFilter, setHostelBlockFilter] = useState(searchParams.get('hostelBlock') || 'all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [assignModalData, setAssignModalData] = useState(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [resolveModalData, setResolveModalData] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cats, depts, staff] = await Promise.all([
          categoryService.getCategories(),
          departmentService.getDepartments(),
          authService.getStaff(),
        ]);
        if (cats.success) setCategories(cats.data);
        if (depts.success) setDepartments(depts.data);
        if (staff.success) setStaffList(staff.data);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    };
    loadMetadata();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;
      if (hostelBlockFilter !== 'all') params.hostelBlock = hostelBlockFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await complaintService.getComplaints(params);
      if (res.success && res.data) {
        setComplaints(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter, departmentFilter, hostelBlockFilter, sortBy, sortOrder, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComplaints();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Open Quick Assign Modal
  const openAssignModal = (complaint) => {
    setAssignModalData(complaint);
    setSelectedDept(complaint.assignedDepartmentId?._id || '');
    setSelectedStaff(complaint.assignedStaffId?._id || '');
    setAssignNote('');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModalData) return;

    setAssigning(true);
    try {
      const res = await complaintService.assignComplaint(assignModalData._id, {
        departmentId: selectedDept || null,
        staffId: selectedStaff || null,
        note: assignNote || 'Assigned by Administrator',
      });
      if (res.success) {
        setAssignModalData(null);
        fetchComplaints();
      }
    } catch (err) {
      alert(err.message || 'Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  // Open Quick Resolve Modal
  const openResolveModal = (complaint) => {
    setResolveModalData(complaint);
    setResolutionNotes('');
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolveModalData || !resolutionNotes.trim()) {
      alert('Resolution notes are mandatory when marking as Resolved.');
      return;
    }

    setResolving(true);
    try {
      const res = await complaintService.updateStatus(resolveModalData._id, {
        status: 'resolved',
        resolutionNotes: resolutionNotes.trim(),
      });
      if (res.success) {
        setResolveModalData(null);
        fetchComplaints();
      }
    } catch (err) {
      alert(err.message || 'Failed to resolve complaint');
    } finally {
      setResolving(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setDepartmentFilter('all');
    setHostelBlockFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const isFiltered =
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    priorityFilter !== 'all' ||
    departmentFilter !== 'all' ||
    hostelBlockFilter !== 'all' ||
    searchQuery.trim() !== '';

  const hostelOptions = [
    'Old MHB',
    'New MHB',
    'A Hostel',
    'B Hostel',
    'C Hostel',
    'D Hostel',
    'E Hostel',
    'F Hostel',
    'G Hostel',
    'PG Hostel 1',
    'PG Hostel 2',
    'MBA Hostel',
    'International Hostel (IH)',
    'LH-A Block',
    'LH-B Block',
    'LH-C Block',
    'Mega Ladies Hostel (MLH)',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            All Complaints Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, assign, triage, and resolve campus-wide complaints across departments
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 transition"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search complaints by ID, title, keyword, or student name..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
          <button
            type="submit"
            className="absolute inset-y-1.5 right-1.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="reopened">Reopened</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Hostel Filter */}
          <select
            value={hostelBlockFilter}
            onChange={(e) => {
              setHostelBlockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Hostels</option>
            {hostelOptions.map((hostel) => (
              <option key={hostel} value={hostel}>
                {hostel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Management Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading campus complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No matching complaints found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try modifying your search or clearing selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <th
                    onClick={() => handleSort('complaintCode')}
                    className="py-3.5 px-4 cursor-pointer hover:text-brand-600 transition"
                  >
                    <span className="flex items-center gap-1">
                      Code <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="py-3.5 px-4">Title & Student</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th
                    onClick={() => handleSort('priority')}
                    className="py-3.5 px-4 cursor-pointer hover:text-brand-600 transition"
                  >
                    <span className="flex items-center gap-1">
                      Priority <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="py-3.5 px-4 cursor-pointer hover:text-brand-600 transition"
                  >
                    <span className="flex items-center gap-1">
                      Status <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="py-3.5 px-4">Assigned Dept / Staff</th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="py-3.5 px-4 cursor-pointer hover:text-brand-600 transition"
                  >
                    <span className="flex items-center gap-1">
                      Date <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {complaints.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                      <Link
                        to={`/admin/complaints/${c._id}`}
                        className="hover:underline"
                      >
                        {c.complaintCode}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        to={`/admin/complaints/${c._id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block truncate"
                      >
                        {c.title}
                      </Link>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        By: <span className="font-medium text-slate-700 dark:text-slate-300">{c.studentId?.name}</span>
                        {c.studentId?.rollNumber ? ` (${c.studentId.rollNumber})` : ''} · {c.location}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {c.categoryId?.name || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {c.assignedDepartmentId ? (
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {c.assignedDepartmentId.name}
                          </p>
                          {c.assignedStaffId && (
                            <p className="text-[10px] text-slate-400">
                              {c.assignedStaffId.name}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {c.createdAt ? format(new Date(c.createdAt), 'MMM d, yyyy') : ''}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                      {/* Assign button */}
                      <button
                        onClick={() => openAssignModal(c)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 text-slate-600 dark:text-slate-300 transition"
                        title="Assign Department / Staff"
                      >
                        <UserCheck size={14} />
                      </button>

                      {/* Quick Resolve button (if in progress or assigned) */}
                      {['assigned', 'in_progress', 'under_review'].includes(c.status) && (
                        <button
                          onClick={() => openResolveModal(c)}
                          className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
                          title="Resolve Complaint"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}

                      {/* Full detail link */}
                      <Link
                        to={`/admin/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-semibold hover:bg-brand-100 transition"
                      >
                        Manage <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          pagination={pagination}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Quick Assign Modal */}
      <Modal
        isOpen={Boolean(assignModalData)}
        onClose={() => setAssignModalData(null)}
        title="Assign Complaint"
        subtitle={`Reference: ${assignModalData?.complaintCode} — ${assignModalData?.title}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Select Department <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Choose Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Assign Staff Member (Optional)
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- No specific staff handler (Department pool) --</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Internal Assignment Note
            </label>
            <textarea
              rows={3}
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              placeholder="Instructions or remarks for the handler..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignModalData(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning || !selectedDept}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
            >
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Resolve Modal */}
      <Modal
        isOpen={Boolean(resolveModalData)}
        onClose={() => setResolveModalData(null)}
        title="Mark Complaint as Resolved"
        subtitle={`Reference: ${resolveModalData?.complaintCode}`}
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
            Resolution notes are required and will be permanently recorded in the audit trail and visible to the student.
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Resolution Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Explain how the issue was fixed, components replaced, or actions taken..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResolveModalData(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving || !resolutionNotes.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              {resolving ? 'Submitting...' : 'Mark as Resolved'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AllComplaints;
