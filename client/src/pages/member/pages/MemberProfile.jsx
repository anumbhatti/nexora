import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiShield,
  FiEdit3,
  FiSave,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function MemberProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/auth/profile");

      if (response.data.success) {
        const profile = response.data.user;

        setUser(profile);

        setFormData({
          name: profile?.name || "",
          email: profile?.email || "",
        });
      }
    } catch (error) {
      console.error("Member Profile Error:", error);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await api.patch(
        "/auth/profile",
        formData
      );

      if (response.data.success) {
        setUser(response.data.user);

        toast.success("Profile updated successfully");
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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* User Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col items-center text-center">

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-3xl font-bold text-sky-600">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "M"}
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              {user?.name || "Member"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {user?.email || "No email"}
            </p>

            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold capitalize text-sky-600">
              <FiShield size={13} />
              {user?.role || "member"}
            </span>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FiUser size={17} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Account Type
                </p>

                <p className="text-sm font-medium capitalize text-slate-700">
                  {user?.role || "Member"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <FiMail size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-400">
                  Email Address
                </p>

                <p className="truncate text-sm font-medium text-slate-700">
                  {user?.email || "No email"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                <FiEdit3 size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your profile information.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-6"
          >

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <div className="relative">
                <FiUser
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
              </label>

              <div className="relative">
                <FiMail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Role
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <FiShield
                  size={18}
                  className="text-slate-400"
                />

                <span className="text-sm font-medium capitalize text-slate-600">
                  {user?.role || "Member"}
                </span>
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <FiRefreshCw
                      size={16}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default MemberProfile;