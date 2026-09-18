import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/api';
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
} from 'lucide-react';
import { format } from 'date-fns';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Reopen modal state
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);

  // Image preview modal state
  const [previewImage, setPreviewImage] = useState(null);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaint(id);
      if (res.success && res.data) {
        setComplaint(res.data);
      } else {
        setError(res.message || 'Complaint not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await complaintService.addComment(id, {
        note: commentText.trim(),
      });
      if (res.success && res.data) {
        setComplaint(res.data);
        setCommentText('');
      }
    } catch (err) {
      alert(err.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setSubmittingReopen(true);
    try {
      const res = await complaintService.reopenComplaint(id, {
        reason: reopenReason.trim(),
      });
      if (res.success && res.data) {
        setComplaint(res.data);
        setReopenModalOpen(false);
        setReopenReason('');
      }
    } catch (err) {
      alert(err.message || 'Failed to reopen complaint');
    } finally {
      setSubmittingReopen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-3" />
        <p className="text-sm">Loading complaint timeline...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card rounded-3xl text-center border border-slate-200 dark:border-slate-800 shadow-xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Unable to Load Complaint
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {error || 'The requested complaint could not be found or you do not have permission to view it.'}
        </p>
        <Link
          to="/student/complaints"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          Back to My Complaints
        </Link>
      </div>
    );
  }

  const canReopen = ['resolved', 'closed'].includes(complaint.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/student/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft size={16} /> Back to My Complaints
        </Link>

        {canReopen && (
          <button
            onClick={() => setReopenModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold transition shadow-sm"
          >
            <RefreshCw size={14} /> Dispute & Reopen Complaint
          </button>
        )}
      </div>

      {/* Main Grid: Left Column Details & Attachments | Right Column Live Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Complaint Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            {/* Header info */}
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
                  <MapPin size={13} className="text-slate-400" /> {complaint.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  Submitted:{' '}
                  {complaint.createdAt
                    ? format(new Date(complaint.createdAt), 'MMM d, yyyy · h:mm a')
                    : ''}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description of Grievance
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                {complaint.description}
              </p>
            </div>

            {/* Resolution Notes Banner if resolved */}
            {complaint.resolutionNotes && (
              <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80">
                <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={16} /> Official Resolution Notes
                </h3>
                <p className="text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  {complaint.resolutionNotes}
                </p>
                {complaint.resolvedAt && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2">
                    Resolved on {format(new Date(complaint.resolvedAt), 'MMMM d, yyyy · h:mm a')}
                  </p>
                )}
              </div>
            )}

            {/* Metadata Badges: Category & Assigned Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Category
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {complaint.categoryId?.name || 'Uncategorized'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assigned Department
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {complaint.assignedDepartmentId?.name || 'Pending assignment'}
                </p>
                {complaint.assignedStaffId && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Handler: {complaint.assignedStaffId.name}
                  </p>
                )}
              </div>
            </div>

            {/* Attachments Section */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Paperclip size={14} /> Attachments ({complaint.attachments.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.attachments.map((att, idx) => (
                    <div
                      key={att._id || idx}
                      className="group rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 p-2 shadow-sm hover:shadow transition"
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

        {/* Right Column: Interactive Activity Timeline & Comment Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Complaint Lifecycle & Timeline
            </h2>

            {/* Stepper Timeline */}
            <ActivityTimeline activityLog={complaint.activityLog} />

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Add Timeline Note / Question
              </label>
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ask a question or provide additional context to the handler..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="w-full py-2 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-brand-600 dark:hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  {submittingComment ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={13} /> Post Note
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Reopen Complaint Modal */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        title="Dispute & Reopen Complaint"
        subtitle={`Complaint Reference: ${complaint.complaintCode}`}
      >
        <form onSubmit={handleReopen} className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
            If you feel the issue was not fully resolved or has re-occurred, describe the reason below to send it back to the department handler.
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Reason for Reopening <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. The Wi-Fi access point worked for 2 hours but is now dropping connections again..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReopenModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReopen || !reopenReason.trim()}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
            >
              {submittingReopen ? 'Submitting...' : 'Reopen Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Full Image Preview Modal */}
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
              alt="Attachment Full View"
              className="max-h-[70vh] rounded-xl object-contain"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComplaintDetails;
