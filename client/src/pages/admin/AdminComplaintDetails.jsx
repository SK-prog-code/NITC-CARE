import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  complaintService,
  departmentService,
  authService,
} from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ActivityTimeline from '../../components/common/ActivityTimeline';
import Modal from '../../components/common/Modal';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  User,
  Paperclip,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  File,
  Eye,
  UserCheck,
  Shield,
  RotateCw,
  Archive,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

const AdminComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Action States
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignNote, setAssignNote] = useState('');

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [commentText, setCommentText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchComplaintAndMetadata = async () => {
    try {
      setLoading(true);
      const [compRes, deptRes, staffRes] = await Promise.all([
        complaintService.getComplaint(id),
        departmentService.getDepartments(),
        authService.getStaff(),
      ]);

      if (compRes.success && compRes.data) {
        setComplaint(compRes.data);
        setSelectedDept(compRes.data.assignedDepartmentId?._id || '');
        setSelectedStaff(compRes.data.assignedStaffId?._id || '');
      } else {
        setError(compRes.message || 'Complaint not found');
      }

      if (deptRes.success) setDepartments(deptRes.data);
      if (staffRes.success) setStaffList(staffRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintAndMetadata();
  }, [id]);

  // Status transitions
  const handleStatusTransition = async (newStatus, note = '') => {
    setUpdating(true);
    try {
      const payload = {
        status: newStatus,
        note: note || `Status updated to ${newStatus.replace('_', ' ')} by administrator`,
      };

      if (newStatus === 'resolved') {
        payload.resolutionNotes = resolutionNotes;
      }

      const res = await complaintService.updateStatus(id, payload);
      if (res.success && res.data) {
        setComplaint(res.data);
        setResolveModalOpen(false);
        setResolutionNotes('');
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // Priority change
  const handlePriorityChange = async (newPriority) => {
    if (newPriority === complaint.priority) return;
    setUpdating(true);
    try {
      const res = await complaintService.updatePriority(id, {
        priority: newPriority,
        note: `Priority changed from ${complaint.priority} to ${newPriority}`,
      });
      if (res.success && res.data) {
        setComplaint(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to update priority');
    } finally {
      setUpdating(false);
    }
  };

  // Assignment submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await complaintService.assignComplaint(id, {
        departmentId: selectedDept || null,
        staffId: selectedStaff || null,
        note: assignNote || 'Assigned by Administrator',
      });
      if (res.success && res.data) {
        setComplaint(res.data);
        setAssignModalOpen(false);
        setAssignNote('');
      }
    } catch (err) {
      alert(err.message || 'Failed to assign complaint');
    } finally {
      setUpdating(false);
    }
  };

  // Add Comment submit
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setUpdating(true);
    try {
      const res = await complaintService.addComment(id, {
        note: commentText.trim(),
      });
      if (res.success && res.data) {
        setComplaint(res.data);
        setCommentText('');
      }
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-3" />
        <p className="text-sm">Loading administrative control room...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card rounded-3xl text-center border border-slate-200 dark:border-slate-800 shadow-xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Complaint Not Found
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <Link
          to="/admin/complaints"
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to All Complaints
        </Link>
      </div>
    );
  }

  const currentStatus = complaint.status;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft size={16} /> Back to All Complaints
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Adjust Priority:
          </span>
          <select
            value={complaint.priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            disabled={updating || currentStatus === 'closed'}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🔵 Medium</option>
            <option value="high">🟠 High</option>
            <option value="critical">🔴 Critical</option>
          </select>
        </div>
      </div>

      {/* State Machine Transition Action Banner */}
      <div className="glass-card rounded-3xl p-6 border border-brand-200 dark:border-brand-900/60 shadow-sm bg-gradient-to-r from-brand-50/40 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider block mb-1">
              Workflow Stage Transition
            </span>
            <div className="flex items-center gap-2">
              <StatusBadge status={currentStatus} size="lg" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Current Ticket State
              </span>
            </div>
          </div>

          {/* Dynamic state machine buttons depending on current status */}
          <div className="flex flex-wrap items-center gap-2">
            {currentStatus === 'submitted' && (
              <>
                <button
                  onClick={() => handleStatusTransition('under_review', 'Admin initiated preliminary review')}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <UserCheck size={14} /> Assign to Department
                </button>
              </>
            )}

            {currentStatus === 'under_review' && (
              <>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <UserCheck size={14} /> Assign to Department
                </button>
                <button
                  onClick={() => handleStatusTransition('in_progress', 'Technician dispatched to begin resolution')}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Start Work (In Progress)
                </button>
              </>
            )}

            {currentStatus === 'assigned' && (
              <>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                >
                  Re-assign
                </button>
                <button
                  onClick={() => handleStatusTransition('in_progress', 'Department initiated active repair')}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Advance to In Progress
                </button>
                <button
                  onClick={() => setResolveModalOpen(true)}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Mark Resolved
                </button>
              </>
            )}

            {currentStatus === 'in_progress' && (
              <>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                >
                  Re-assign Dept
                </button>
                <button
                  onClick={() => setResolveModalOpen(true)}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Mark Resolved with Notes
                </button>
              </>
            )}

            {currentStatus === 'resolved' && (
              <>
                <button
                  onClick={() => handleStatusTransition('closed', 'Resolution verified by administrator and archived')}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <Archive size={14} /> Verify & Close Complaint
                </button>
              </>
            )}

            {currentStatus === 'reopened' && (
              <>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Re-assign Department
                </button>
                <button
                  onClick={() => handleStatusTransition('in_progress', 'Reopened issue investigation underway')}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Restart Work (In Progress)
                </button>
              </>
            )}

            {currentStatus === 'closed' && (
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                🔒 Ticket is Closed & Archived
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Complaint Meta & Description */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="font-mono text-xs font-extrabold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg border border-brand-200 dark:border-brand-800">
                  {complaint.complaintCode}
                </span>
                <StatusBadge status={complaint.status} size="md" />
                <PriorityBadge priority={complaint.priority} size="md" />
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {complaint.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {complaint.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  Submitted:{' '}
                  {complaint.createdAt
                    ? format(new Date(complaint.createdAt), 'MMM d, yyyy · h:mm a')
                    : ''}
                </span>
              </div>
            </div>

            {/* Student Submitter Card */}
            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60">
              <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider block mb-1">
                Reported by Student
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {complaint.studentId?.name || 'Student'}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Email: {complaint.studentId?.email}
                  </p>
                </div>
                {complaint.studentId?.rollNumber && (
                  <span className="font-mono font-semibold px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-brand-600 dark:text-brand-300 border border-sky-200 dark:border-sky-800">
                    Roll: {complaint.studentId.rollNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                {complaint.description}
              </p>
            </div>

            {/* Resolution Notes Banner */}
            {complaint.resolutionNotes && (
              <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80">
                <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={16} /> Official Resolution Notes
                </h3>
                <p className="text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  {complaint.resolutionNotes}
                </p>
              </div>
            )}

            {/* Assigned Department Info */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block mb-0.5">
                  Assigned Routing
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {complaint.assignedDepartmentId?.name || 'Unassigned'}
                </p>
                {complaint.assignedStaffId && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Handler: {complaint.assignedStaffId.name} ({complaint.assignedStaffId.email})
                  </p>
                )}
              </div>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-800 shadow-sm transition"
              >
                Change Assignment
              </button>
            </div>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Paperclip size={14} /> Attachments ({complaint.attachments.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.attachments.map((att, idx) => (
                    <div
                      key={att._id || idx}
                      className="group rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 p-2 shadow-sm"
                    >
                      {att.fileType === 'pdf' ? (
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-24 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl flex flex-col items-center justify-center hover:bg-rose-100 transition"
                        >
                          <File size={28} />
                          <span className="text-[10px] font-bold mt-1 flex items-center gap-1">
                            Open PDF <ExternalLink size={10} />
                          </span>
                        </a>
                      ) : (
                        <div
                          onClick={() => setPreviewImage(att.fileUrl)}
                          className="relative h-24 rounded-xl overflow-hidden cursor-pointer"
                        >
                          <img
                            src={att.fileUrl}
                            alt={att.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye size={18} />
                          </div>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate mt-1.5 px-1 font-medium">
                        {att.fileName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Activity Log & Admin Commenting */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Audit Trail & Timeline
            </h2>

            <ActivityTimeline activityLog={complaint.activityLog} />

            {/* Post Internal/Public Note */}
            <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Add Audit Log Note / Instruction
              </label>
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Record investigation notes, vendor follow-ups, or instructions..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <button
                  type="submit"
                  disabled={updating || !commentText.trim()}
                  className="w-full py-2 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-brand-600 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Send size={13} /> Log Note to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Department & Staff Handler"
        subtitle={`Complaint Reference: ${complaint.complaintCode}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Department <span className="text-rose-500">*</span>
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
              Staff Handler
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- No specific staff (Department pool) --</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Assignment Note
            </label>
            <textarea
              rows={3}
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              placeholder="Instructions for the assigned department..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating || !selectedDept}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Mark Complaint as Resolved"
        subtitle={`Complaint Reference: ${complaint.complaintCode}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl">
            Please enter detailed resolution notes explaining how the issue was fixed.
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
              placeholder="Detailed report of the repair, parts replaced, or service conducted..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleStatusTransition('resolved')}
              disabled={updating || !resolutionNotes.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              Confirm Resolution
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        title="Attachment Preview"
        maxWidth="max-w-3xl"
      >
        {previewImage && (
          <div className="flex items-center justify-center">
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-h-[70vh] rounded-xl object-contain"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminComplaintDetails;
