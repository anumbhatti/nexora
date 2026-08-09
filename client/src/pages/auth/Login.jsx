import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiArrowRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==============================
  // Handle Input Change
  // ==============================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ==============================
  // Handle Login
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!formData.password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        formData.email,
        formData.password
      );

      toast.success("Login successful!");

      const role = response?.user?.role;

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "manager") {
        navigate("/manager");
      } else if (role === "member") {
        navigate("/member");
      } else {
        toast.error("Invalid user role");
      }
    } catch (error) {
      console.error("Login Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid lg:grid-cols-2">

        {/* =================================
            LEFT SIDE
        ================================= */}

        <div className="hidden lg:flex bg-slate-900 p-12 text-white flex-col justify-between">

          <div>

            {/* Logo */}

            <div className="flex items-center gap-3">

              <div className="h-11 w-11 rounded-xl bg-sky-500 flex items-center justify-center font-bold text-xl">
                N
              </div>

              <span className="text-2xl font-bold">
                Nexora
              </span>

            </div>

            {/* Hero Text */}

            <div className="mt-24">

              <p className="text-sky-400 font-semibold tracking-wider text-sm mb-4">
                PROJECT MANAGEMENT
              </p>

              <h1 className="text-5xl font-bold leading-tight">
                Manage work.
                <br />
                Empower teams.
              </h1>

              <p className="mt-6 text-slate-400 text-lg leading-8 max-w-md">
                Plan projects, manage tasks and keep
                your entire team aligned from one
                powerful workspace.
              </p>

            </div>

          </div>

          {/* Copyright */}

          <p className="text-sm text-slate-500">
            © 2026 Nexora. All rights reserved.
          </p>

        </div>

        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div className="p-8 sm:p-12 flex items-center">

          <div className="w-full max-w-md mx-auto">

            {/* Mobile Logo */}

            <div className="lg:hidden flex items-center gap-3 mb-10">

              <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                N
              </div>

              <span className="text-2xl font-bold text-slate-900">
                Nexora
              </span>

            </div>

            {/* Heading */}

            <div className="mb-8">

              <h2 className="text-3xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-slate-500">
                Sign in to continue to your workspace.
              </p>

            </div>

            {/* =================================
                LOGIN FORM
            ================================= */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>

                <div className="relative">

                  <FiMail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={19}
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <FiLock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={19}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  />

                  {/* Show / Hide Password */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={19} />
                    ) : (
                      <FiEye size={19} />
                    )}
                  </button>

                </div>

              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="group w-full rounded-xl bg-sky-500 py-3.5 text-white font-semibold transition hover:bg-sky-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >

                {loading ? (
                  <>
                    <span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <FiArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}

              </button>

            </form>

            {/* Information */}

            <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-4">

              <p className="text-xs text-slate-500 leading-5">
                Access to Nexora is based on your assigned
                account role. Administrators, Project Managers
                and Team Members have different permissions.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;