import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  User,
  ShieldCheck,
  Power,
  X,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const Employees = () => {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
  });
  const [creating, setCreating] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    status: "active",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      if (res.data.success) {
        setEmployees(res.data.employees || []);
      }
    } catch (err) {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/employees", newEmployee);
      toast.success(res.data.message || "Employee created");
      setCreateModalOpen(false);
      setNewEmployee({ name: "", username: "", password: "", email: "" });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create employee");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (emp) => {
    setEditEmployee(emp);
    setEditForm({
      name: emp.name,
      username: emp.username,
      password: "",
      email: emp.email || "",
      status: emp.status,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const payload = {
        name: editForm.name,
        username: editForm.username,
        email: editForm.email,
        status: editForm.status,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const res = await api.put(`/employees/${editEmployee._id || editEmployee.id}`, payload);
      toast.success(res.data.message || "Employee updated");
      setEditModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    const nextStatus = emp.status === "active" ? "disabled" : "active";
    try {
      await api.put(`/employees/${emp._id || emp.id}`, { status: nextStatus });
      toast.success(`Account ${emp.name} marked as ${nextStatus}`);
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to change employee status");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.employee) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/employees/${deleteModal.employee._id || deleteModal.employee.id}`);
      toast.success(res.data.message || "Employee deleted");
      setDeleteModal({ open: false, employee: null });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Health Gym Staff & Employees
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Create and manage employee accounts in Firebase Firestore. All actions by employees will record "Handle by: &lt;Name&gt;".
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading staff records from Firestore...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No employee accounts created yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click 'Add New Employee' to provide your counter staff with login credentials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => {
            const empId = emp._id || emp.id;

            return (
              <div
                key={empId}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-black text-lg flex items-center justify-center">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {emp.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600">@{emp.username}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      emp.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                  <p>Email: {emp.email || "No email provided"}</p>
                  <p>Role: Health Gym Counter Staff</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(emp)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      emp.status === "active"
                        ? "text-rose-600 hover:bg-rose-50"
                        : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{emp.status === "active" ? "Disable" : "Enable"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(emp)}
                      className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Edit Employee / Change Password"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ open: true, employee: emp })}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE EMPLOYEE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Create Employee Account</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="e.g. Hamza Tariq"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  required
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                  placeholder="e.g. staff1"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="staff@gmail.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 min-h-[44px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {creating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {editModalOpen && editEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Edit Employee Profile</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Change Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="New password (optional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 font-bold min-h-[44px]"
                >
                  <option value="active">Active (Access allowed)</option>
                  <option value="disabled">Disabled (Access blocked)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE EMPLOYEE CONFIRMATION */}
      {deleteModal.open && deleteModal.employee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete Employee Account?</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove <strong>{deleteModal.employee.name}</strong> (@{deleteModal.employee.username})? They will no longer be able to log in.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setDeleteModal({ open: false, employee: null })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
