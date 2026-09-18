import React, { useState, useEffect } from 'react';
import { categoryService, departmentService } from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  Tag,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  Building2,
  Loader2,
  AlertCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultDepartmentId: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCategoriesAndDepts = async () => {
    try {
      setLoading(true);
      const [catsRes, deptsRes] = await Promise.all([
        categoryService.getCategories({ includeInactive: true }),
        departmentService.getDepartments(),
      ]);
      if (catsRes.success && catsRes.data) setCategories(catsRes.data);
      if (deptsRes.success && deptsRes.data) setDepartments(deptsRes.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndDepts();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      defaultDepartmentId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      defaultDepartmentId: cat.defaultDepartmentId?._id || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setIsModalOpen(false);
      fetchCategoriesAndDepts();
    } catch (err) {
      alert(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await categoryService.updateCategory(cat._id, {
        isActive: !cat.isActive,
      });
      fetchCategoriesAndDepts();
    } catch (err) {
      alert(err.message || 'Failed to toggle category status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Complaint Categories
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain issue categories and map default auto-routing departments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/management"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            Manage Departments
          </Link>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-glow transition flex items-center gap-1.5"
          >
            <PlusCircle size={15} /> Add Category
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <Link
          to="/admin/management"
          className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold transition"
        >
          Departments
        </Link>
        <span className="px-4 py-2 border-b-2 border-brand-600 text-brand-600 dark:text-brand-400 font-bold text-xs">
          Categories ({categories.length})
        </span>
      </div>

      {/* Categories Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Tag className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No categories found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Default Mapped Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {categories.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition group"
                  >
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                          <Tag size={15} />
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-sm text-slate-600 dark:text-slate-400">
                      {c.description || 'General category'}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {c.defaultDepartmentId ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                          <Sparkles size={12} /> {c.defaultDepartmentId.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No default mapping</span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                        title="Edit Category"
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

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        subtitle="Define complaint category and default assignment"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Wi-Fi / Network, Classroom, Laboratory"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Default Auto-Routed Department
            </label>
            <select
              value={formData.defaultDepartmentId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultDepartmentId: e.target.value,
                })
              }
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- None / Manual Assignment --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              *When students select this category, tickets can automatically route to this department.
            </p>
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
              placeholder="Examples of issues under this category..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
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
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
