import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService, categoryService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  FileText,
  Upload,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  MapPin,
  Tag,
  ArrowRight,
  Sparkles,
  Paperclip,
  File,
} from 'lucide-react';

const NITC_HOSTELS = [
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

const NITC_MESSES = [
  'Mess A',
  'Mess B',
  'Mess C',
  'Mess D',
  'Mess E',
  'Mess F',
  'Mess G',
  'MHB 1-1',
  'MHB 1-2',
  'MHB 2-1',
  'MHB 2-2',
  'MHB 2-3',
  'LH Mess',
];

const SubmitComplaint = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    location: '',
    description: '',
    priority: 'medium',
    hostelBlock: 'Old MHB',
    roomNumber: '',
    messName: 'MHB 1-1',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        hostelBlock: user.hostelBlock || prev.hostelBlock || 'Old MHB',
        roomNumber: user.roomNumber || prev.roomNumber || '',
        messName: user.messName || prev.messName || 'MHB 1-1',
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: res.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleQuickLocation = (loc) => {
    setFormData((prev) => ({ ...prev, location: loc }));
  };

  const handleFiles = (files) => {
    const fileList = Array.from(files);
    const validFiles = [];
    const newPreviews = [];

    if (selectedFiles.length + fileList.length > 5) {
      setError('You can upload a maximum of 5 attachments.');
      return;
    }

    for (const file of fileList) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 5MB size limit.`);
        return;
      }

      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'application/pdf',
      ];
      if (!validTypes.includes(file.type)) {
        setError(`File "${file.name}" is not a supported format (JPG, PNG, PDF only).`);
        return;
      }

      validFiles.push(file);
      if (file.type.startsWith('image/')) {
        newPreviews.push({
          name: file.name,
          url: URL.createObjectURL(file),
          type: 'image',
          size: (file.size / 1024).toFixed(0) + ' KB',
        });
      } else {
        newPreviews.push({
          name: file.name,
          url: null,
          type: 'pdf',
          size: (file.size / 1024).toFixed(0) + ' KB',
        });
      }
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
    setError('');
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { title, categoryId, location, description, priority, hostelBlock, roomNumber } = formData;

    if (!title.trim() || !categoryId || !hostelBlock || !location.trim() || !description.trim()) {
      setError('Please fill in all mandatory fields, including your hostel block and location.');
      return;
    }

    if (!roomNumber.trim()) {
      setError('Please enter your room number so the maintenance team can locate the issue quickly.');
      return;
    }

    if (description.trim().length < 20) {
      setError('Please write at least 20 characters in the description for clarity.');
      return;
    }

    setSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', title.trim());
      formPayload.append('categoryId', categoryId);
      formPayload.append('location', location.trim());
      formPayload.append('description', description.trim());
      formPayload.append('priority', priority);
      formPayload.append('hostelBlock', hostelBlock);
      formPayload.append('roomNumber', roomNumber.trim());
      formPayload.append('messName', formData.messName || '');

      selectedFiles.forEach((file) => {
        formPayload.append('attachments', file);
      });

      const res = await complaintService.createComplaint(formPayload);

      if (res.success && res.data) {
        setSubmittedCode(res.data.complaintCode);
        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        setTimeout(() => {
          navigate(`/student/complaints/${res.data._id}`);
        }, 2000);
      } else {
        setError(res.message || 'Failed to submit complaint.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while submitting complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c._id === formData.categoryId);

  if (submittedCode) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 glass-card rounded-3xl text-center shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Complaint Submitted!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Your complaint reference code has been generated:
        </p>
        <div className="inline-block px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-mono text-base font-extrabold border border-brand-200 dark:border-brand-800 mb-6">
          {submittedCode}
        </div>
        <p className="text-xs text-slate-400 animate-pulse">
          Redirecting to complaint tracking timeline...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-2">
          <FileText size={14} /> New Ticket Submission
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Report a Campus Issue
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Provide accurate details and photos to help the department resolve your issue swiftly.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-sm">
          {/* Title */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Complaint Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.title.length}/120
              </span>
            </div>
            <input
              type="text"
              name="title"
              required
              maxLength={120}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Broken water cooler leaking on 2nd floor library hallway"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={loadingCategories}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Department Auto-Routing preview badge */}
              {selectedCategoryObj?.defaultDepartmentId && (
                <p className="text-[11px] text-brand-600 dark:text-brand-400 mt-1.5 flex items-center gap-1">
                  <Sparkles size={12} /> Auto-routed to:{' '}
                  <strong>{selectedCategoryObj.defaultDepartmentId.name}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Suggested Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              >
                <option value="low">Low (Cosmetic issue / Minor suggestion)</option>
                <option value="medium">Medium (Equipment faulty / Disruptive)</option>
                <option value="high">High (Major outage / Class blocked)</option>
                <option value="critical">Critical (Safety hazard / Emergency)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                *Admin verifies final priority during triage.
              </p>
            </div>
          </div>

          {/* Hostel / Room / Mess Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Hostel Block <span className="text-rose-500">*</span>
              </label>
              <select
                name="hostelBlock"
                value={formData.hostelBlock}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              >
                {NITC_HOSTELS.map((hostel) => (
                  <option key={hostel} value={hostel}>
                    {hostel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Room Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="roomNumber"
                required
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="e.g. MH1-304 or LH-A-215"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Mess Name
              </label>
              <select
                name="messName"
                value={formData.messName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              >
                {NITC_MESSES.map((mess) => (
                  <option key={mess} value={mess}>
                    {mess}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Specific Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin size={16} />
              </div>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Hostel Block B, 3rd Floor Room 312 or Academic Block A LH-102"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>

            {/* Quick location pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400">Quick suggestions:</span>
              {[
                'Hostel Block A',
                'Hostel Block B',
                'Central Library 2nd Floor',
                'Lecture Hall 102 (Block A)',
                'Computer Lab 3 (IT Block)',
                'Main Dining Hall',
              ].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleQuickLocation(loc)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] transition"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] ${
                  formData.description.length < 20
                    ? 'text-amber-500'
                    : 'text-slate-400'
                }`}
              >
                {formData.description.length}/2000 (min 20 chars)
              </span>
            </div>
            <textarea
              name="description"
              required
              rows={5}
              maxLength={2000}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what is broken, how long the issue has persisted, and any specific impacts on classes or living conditions..."
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          {/* Attachments Upload (up to 5 files, 5MB each) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Attachments (Optional — Images or PDFs, Max 5 files, 5MB each)
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Click to browse or drag and drop photos / PDFs here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                JPG, PNG, WEBP, or PDF up to 5MB each
              </p>
            </div>

            {/* Preview Thumbnails */}
            {filePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                {filePreviews.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-sm"
                  >
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-20 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg flex flex-col items-center justify-center">
                        <File size={24} />
                        <span className="text-[10px] font-bold mt-1">PDF</span>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate mt-1">
                      {file.name}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-glow hover:shadow-glow-lg transition flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting Ticket...
              </>
            ) : (
              <>
                Submit Complaint
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitComplaint;
