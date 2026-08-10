import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiShield,
  FiLock,
  FiSave,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function ManagerProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ========================================
  // Fetch Profile
  // ========================================

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/profile");

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error(
        "Manager Profile Error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ========================================
  // Password Change
  // ========================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(
        "New password must be at least 6 characters"
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch(
        "/users/change-password",
        {
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
        }
      );

      if (response.data.success) {
        toast.success(
          "Password changed successfully"
        );

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error(
        "Change Password Error:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={28}
            className="mx-auto animate-spin text-sky-500"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="space-y-6">

      {/* ========================================
          Header
      ======================================== */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your account information and manage
          your password.
        </p>
      </div>

      {/* ========================================
          Profile Card
      ======================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Profile Header */}

        <div className="border-b border-slate-100 p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {/* Avatar */}

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-2xl font-bold text-sky-600">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "M"}
            </div>

            {/* User Info */}

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {user?.name || "Manager"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {user?.email}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold capitalize text-sky-600">
                <FiShield size={13} />
                {user?.role || "manager"}
              </div>
            </div>

          </div>

        </div>

        {/* Account Information */}

        <div className="p-6">

          <h3 className="text-lg font-semibold text-slate-900">
            Account Information
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Your current account details.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Name */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
                  <FiUser size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Full Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {user?.name || "—"}
                  </p>
                </div>

              </div>

            </div>

            {/* Email */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
                  <FiMail size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    Email Address
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {user?.email || "—"}
                  </p>
                </div>

              </div>

            </div>

            {/* Role */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm">
                  <FiShield size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Account Role
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                    {user?.role || "—"}
                  </p>
                </div>

              </div>

            </div>

            {/* Status */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm">
                  <FiShield size={18} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Account Status
                  </p>

                  <p className="mt-1 text-sm font-semibold text-emerald-600">
                    {user?.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================
          Change Password
      ======================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
            <FiLock size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your account password securely.
            </p>
          </div>

        </div>

        <form
          onSubmit={handleChangePassword}
          className="mt-6 space-y-5"
        >

          {/* Current Password */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Current Password
            </label>

            <input
              type="password"
              name="currentPassword"
              value={
                passwordForm.currentPassword
              }
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* New Password */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Confirm Password */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm New Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={
                passwordForm.confirmPassword
              }
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Save */}

          <div className="flex justify-end">

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave size={16} />

              {saving
                ? "Updating..."
                : "Update Password"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ManagerProfile;