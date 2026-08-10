import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });

  // ==========================================
  // Fetch Users
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/api/users");

      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Users Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // Search + Filter
  // ==========================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        user.email
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // ==========================================
  // Open Create Modal
  // ==========================================

  const openCreateModal = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "member",
    });

    setShowModal(true);
  };

  // ==========================================
  // Open Edit Modal
  // ==========================================

  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "member",
    });

    setShowModal(true);
  };

  // ==========================================
  // Handle Input
  // ==========================================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==========================================
  // Create / Update User
  // ==========================================

// ==========================================
// Create / Update User
// ==========================================

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name.trim()) {
    toast.error("Name is required");
    return;
  }

  if (!formData.email.trim()) {
    toast.error("Email is required");
    return;
  }

  if (!editingUser && !formData.password) {
    toast.error("Password is required");
    return;
  }

  try {
    setSaving(true);

    // ==============================
    // Update Existing User
    // ==============================
    if (editingUser) {
      const response = await api.patch(
        `/users/${editingUser._id}`,
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }
      );

      if (response.data.success) {
        toast.success("User updated successfully");
      }
    }

    // ==============================
    // Create New User
    // ==============================
    else {
      const response = await api.post(
        "/users",
        formData
      );

      if (response.data.success) {
        toast.success("User created successfully");
      }
    }

    setShowModal(false);
    await fetchUsers();

  } catch (error) {
    console.error("Save User Error:", error);

    toast.error(
      error?.response?.data?.message ||
        "Failed to save user"
    );
  } finally {
    setSaving(false);
  }
};

  // ==========================================
  // Toggle User Status
  // ==========================================

  const toggleStatus = async (user) => {
    try {
      const response = await api.patch(
        `/users/${user._id}/status`,
        {
          isActive: !user.isActive,
        }
      );

      if (response.data.success) {
        toast.success(
          user.isActive
            ? "User deactivated"
            : "User activated"
        );

        await fetchUsers();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update user status"
      );
    }
  };

  // ==========================================
  // Delete User
  // ==========================================

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(
        `/users/${user._id}`
      );

      if (response.data.success) {
        toast.success("User deleted successfully");
        await fetchUsers();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete user"
      );
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

          <p className="text-sm text-slate-500">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-medium text-sky-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage users, roles and account access.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
        >
          <FiPlus size={18} />
          Add User
        </button>

      </div>

      {/* Filters */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
            />

          </div>

          {/* Role Filter */}

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
          </select>

          {/* Refresh */}

          <button
            onClick={fetchUsers}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <FiRefreshCw size={17} />
            Refresh
          </button>

        </div>

      </div>

      {/* Users Table */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[800px]">

            <thead className="border-b border-slate-100 bg-slate-50">

              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  User
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* User */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700">
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <p className="font-medium text-slate-800">
                            {user.name}
                          </p>

                          <p className="text-sm text-slate-400">
                            {user.email}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Role */}

                    <td className="px-6 py-4">

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                        {user.role}
                      </span>

                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.isActive
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        />

                        {user.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    {/* Actions */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditModal(user)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                          title="Edit user"
                        >
                          <FiEdit2 size={17} />
                        </button>

                        <button
                          onClick={() =>
                            toggleStatus(user)
                          }
                          className={`rounded-lg p-2 ${
                            user.isActive
                              ? "text-amber-500 hover:bg-amber-50"
                              : "text-emerald-500 hover:bg-emerald-50"
                          }`}
                          title={
                            user.isActive
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          {user.isActive ? (
                            <FiUserX size={17} />
                          ) : (
                            <FiUserCheck size={17} />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            deleteUser(user)
                          }
                          className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete user"
                        >
                          <FiTrash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-16 text-center"
                  >
                    <p className="font-medium text-slate-600">
                      No users found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Create / Edit Modal */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUser
                    ? "Edit User"
                    : "Create User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingUser
                    ? "Update user information."
                    : "Add a new user to Nexora."}
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
              </div>

              {/* Password */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                  {editingUser && (
                    <span className="ml-2 text-xs text-slate-400">
                      Optional
                    </span>
                  )}
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    editingUser
                      ? "Leave empty to keep current password"
                      : "Minimum 6 characters"
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
              </div>

              {/* Role */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
                >
                  <option value="member">
                    Team Member
                  </option>

                  <option value="manager">
                    Project Manager
                  </option>

                  <option value="admin">
                    Administrator
                  </option>
                </select>
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Users;