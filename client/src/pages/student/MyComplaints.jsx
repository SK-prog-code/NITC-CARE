import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService, categoryService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Pagination from '../../components/common/Pagination';
import {
  Search,
  Filter,
  PlusCircle,
  Calendar,
  MapPin,
  FileText,
  Loader2,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Filters
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const statusTabs = [
    { key: 'all', label: 'All Complaints' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'assigned,in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
    { key: 'reopened', label: 'Reopened' },
  ];

  // Load Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch complaints whenever filters change
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 8,
        sortBy,
        sortOrder,
      };

      if (activeStatusTab !== 'all') {
        params.status = activeStatusTab;
      }
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (selectedPriority !== 'all') {
        params.priority = selectedPriority;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

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
  }, [activeStatusTab, selectedCategory, selectedPriority, currentPage, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComplaints();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Complaints
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track, filter, and inspect the real-time lifecycle of all your submitted tickets
          </p>
        </div>

        <Link
          to="/student/submit"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-glow hover:shadow-glow-lg transition shrink-0"
        >
          <PlusCircle size={16} /> Submit New Complaint
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveStatusTab(tab.key);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeStatusTab === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Secondary Filter Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="w-full lg:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID (e.g. CMP-2026-000101) or title..."
            className="w-full pl-10 pr-20 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
          <button
            type="submit"
            className="absolute inset-y-1 right-1 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
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

          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
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

          {/* View mode toggle */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <TableIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Content List */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Fetching your complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-base text-slate-800 dark:text-slate-200">
              No matching complaints found
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try adjusting your search terms or active status filter.
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {complaints.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                      {c.complaintCode}
                    </td>

                    <td className="py-4 px-4 max-w-md">
                      <Link
                        to={`/student/complaints/${c._id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block truncate"
                      >
                        {c.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        <MapPin size={12} className="shrink-0" />
                        <span>{c.location}</span>
                        {c.assignedDepartmentId && (
                          <>
                            <span>·</span>
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              {c.assignedDepartmentId.name}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {c.categoryId?.name || 'General'}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {c.createdAt ? format(new Date(c.createdAt), 'MMM d, yyyy') : ''}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/student/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-brand-50 hover:border-brand-300 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                      >
                        Details <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600 bg-white dark:bg-slate-900/50 shadow-sm transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                    {c.complaintCode}
                  </span>
                  <StatusBadge status={c.status} size="sm" />
                </div>

                <div>
                  <Link
                    to={`/student/complaints/${c._id}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 block line-clamp-1"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {c.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <PriorityBadge priority={c.priority} size="sm" />
                  <Link
                    to={`/student/complaints/${c._id}`}
                    className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    Track Progress <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          pagination={pagination}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  );
};

export default MyComplaints;
