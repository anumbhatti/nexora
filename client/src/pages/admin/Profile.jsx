import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiShield,
  FiLock,
  FiSave,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);

  const [name, setName] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ========================================
  // Get Profile
  // ========================================

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/profile");

      if (response.data.success) {
        const user = response.data.user;

        setProfile(user);
        setName(user.name || "");
      }
    } catch (error) {
      console.error("Profile Error:", error);

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
  // Update Profile
  // ========================================

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);

      /*
       * Admin's own profile is updated through
       * the /users/:id endpoint.
       */

      const response = await api.patch(
        `/users/${profile._id}`,
        {
          name: name.trim(),
        }
      );

      if (response.data.success) {
        setProfile(response.data.user);

        toast.success(
          "Profile updated successfully"
        );
      }
    } catch (error) {
      console.error("Update Profile Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // Password Change
  // ========================================

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.error(
        "Please fill all password fields"
      );
      return;
    }

    if (newPassword.length < 6) {
      toast.error(
        "New password must be at least 6 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        "New passwords do not match"
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.patch(
        "/users/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      if (response.data.success) {
        toast.success(
          "Password changed successfully"
        );

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error(
        "Change Password Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

          <p className="text-sm text-slate-500">
            Loading profile...
          </p>

        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Profile could not be loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =====================================
          Header
      ====================================== */}

      <div>
        <p className="text-sm font-medium text-sky-500">
          Account
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your Nexora administrator account.
        </p>
      </div>

      {/* =====================================
          Profile Card
      ====================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Left Profile Summary */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col items-center text-center">

            {/* Avatar */}

            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-500 text-3xl font-bold text-white shadow-lg shadow-sky-500/20">
              {profile.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              {profile.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {profile.email}
            </p>

            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-xs font-semibold capitalize text-sky-600">
              <FiShield size={14} />
              {profile.role}
            </span>

          </div>

          {/* Account Information */}

          <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FiMail size={16} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Email
                </p>

                <p className="text-sm font-medium text-slate-700">
                  {profile.email}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FiShield size={16} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Account Role
                </p>

                <p className="text-sm font-medium capitalize text-slate-700">
                  {profile.role}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="space-y-6 xl:col-span-2">

          {/* =================================
              Edit Profile
          ================================== */}

          <form
            onSubmit={handleProfileUpdate}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className="mb-6">

              <h2 className="text-lg font-bold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your account information.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* Name */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="relative">

                  <FiUser
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                    placeholder="Enter your name"
                  />

                </div>

              </div>

              {/* Email */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <div className="relative">

                  <FiMail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none"
                  />

                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Email cannot be changed here.
                </p>

              </div>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={17} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

          {/* =================================
              Change Password
          ================================== */}

          <form
            onSubmit={handlePasswordChange}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div className="mb-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <FiLock size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Change Password
                  </h2>

                  <p className="text-sm text-slate-500">
                    Keep your account secure.
                  </p>
                </div>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

              {/* Current */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>

                <input
                  type="password"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword:
                        e.target.value,
                    })
                  }
                  placeholder="Current password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />

              </div>

              {/* New */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>

                <input
                  type="password"
                  value={
                    passwordData.newPassword
                  }
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword:
                        e.target.value,
                    })
                  }
                  placeholder="New password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />

              </div>

              {/* Confirm */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword:
                        e.target.value,
                    })
                  }
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />

              </div>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiLock size={17} />

                {changingPassword
                  ? "Updating..."
                  : "Change Password"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Profile;