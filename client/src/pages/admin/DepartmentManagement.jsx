import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Building2,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getDepartments();
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      description: '',
      contactEmail: '',
      contactPhone: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      contactEmail: dept.contactEmail || '',
      contactPhone: dept.contactPhone || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept._id, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert(err.message || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (dept) => {
    try {
      await departmentService.updateDepartment(dept._id, {
        isActive: !dept.isActive,
      });
      fetchDepartments();
    } catch (err) {
      alert(err.message || 'Failed to update department status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Department & Category Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure campus departments and categories for automated complaint routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/categories"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            Manage Categories
          </Link>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-glow transition flex items-center gap-1.5"
          >
            <PlusCircle size={15} /> Add Department
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <span className="px-4 py-2 border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 font-bold text-xs">
          Departments ({departments.length})
        </span>
        <Link
          to="/admin/categories"
          className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold transition"
        >
          Categories
        </Link>
      </div>

      {/* Departments Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading campus departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No departments found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <th className="py-3.5 px-4">Department Name</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {departments.map((d) => (
                  <tr
                    key={d._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition group"
                  >
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                          <Building2 size={16} />
                        </div>
                        <span>{d.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-sm text-slate-600 dark:text-slate-400">
                      {d.description || 'No description provided.'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 space-y-0.5">
                      {d.contactEmail && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail size={12} className="text-slate-400" />
                          <span>{d.contactEmail}</span>
                        </div>
                      )}
                      {d.contactPhone && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone size={12} className="text-slate-400" />
                          <span>{d.contactPhone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(d)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                          d.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {d.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => openEditModal(d)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                        title="Edit Department"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        subtitle="Campus administrative department for complaint routing"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. IT & Network Infrastructure"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Responsibilities and campus coverage..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                placeholder="dept@college.edu"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
