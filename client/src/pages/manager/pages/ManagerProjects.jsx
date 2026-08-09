import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiFolder,
  FiSearch,
  FiFilter,
  FiUsers,
  FiCalendar,
  FiArrowRight,
  FiRefreshCw,
  FiClock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function ManagerProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  // ========================================
  // Fetch Manager Projects
  // ========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/projects/manager/my-projects",
        {
          params: {
            search: search || undefined,
            status: status || undefined,
            priority: priority || undefined,
          },
        }
      );

      if (response.data.success) {
        setProjects(response.data.projects || []);
      }
    } catch (error) {
      console.error("Manager Projects Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [status, priority]);

  // ========================================
  // Search
  // ========================================

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  // ========================================
  // Helpers
  // ========================================

  const getStatusStyle = (projectStatus) => {
    switch (projectStatus) {
      case "completed":
        return "bg-emerald-50 text-emerald-600";

      case "in-progress":
        return "bg-sky-50 text-sky-600";

      case "on-hold":
        return "bg-amber-50 text-amber-600";

      case "cancelled":
        return "bg-red-50 text-red-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getPriorityStyle = (projectPriority) => {
    switch (projectPriority) {
      case "critical":
        return "bg-red-50 text-red-600";

      case "high":
        return "bg-orange-50 text-orange-600";

      case "medium":
        return "bg-amber-50 text-amber-600";

      default:
        return "bg-emerald-50 text-emerald-600";
    }
  };

  const formatStatus = (value) => {
    if (!value) return "Planning";

    return value
      .replace("-", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
            <FiRefreshCw
              size={22}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ========================================
          Header
      ======================================== */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            My Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor the projects assigned to you.
          </p>
        </div>

        <button
          onClick={fetchProjects}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* ========================================
          Search + Filters
      ======================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}

          <form
            onSubmit={handleSearch}
            className="relative flex-1"
          >
            <FiSearch
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search projects..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </form>

          {/* Status */}

          <div className="relative">
            <FiFilter
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="h-11 w-full min-w-[160px] appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-8 text-sm text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">
                All Status
              </option>

              <option value="planning">
                Planning
              </option>

              <option value="in-progress">
                In Progress
              </option>

              <option value="on-hold">
                On Hold
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>

          {/* Priority */}

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
            className="h-11 min-w-[160px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">
              All Priorities
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>

            <option value="critical">
              Critical
            </option>
          </select>

        </div>
      </div>

      {/* ========================================
          Project Count
      ======================================== */}

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">
            Showing
          </p>

          <p className="text-lg font-bold text-slate-900">
            {projects.length}{" "}
            {projects.length === 1
              ? "Project"
              : "Projects"}
          </p>
        </div>

        <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
          <FiFolder size={16} />
          Assigned projects
        </div>

      </div>

      {/* ========================================
          Projects
      ======================================== */}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <FiFolder size={28} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-800">
            No projects found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            No projects match your current filters.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {projects.map((project) => (

            <div
              key={project._id}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-md"
            >

              {/* Top */}

              <div className="flex items-start justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                    <FiFolder size={21} />
                  </div>

                  <div className="min-w-0">

                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {project.name}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Project
                    </p>

                  </div>

                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                    project.status
                  )}`}
                >
                  {formatStatus(project.status)}
                </span>

              </div>

              {/* Description */}

              <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500">
                {project.description ||
                  "No project description available."}
              </p>

              {/* Progress */}

              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-xs font-medium text-slate-500">
                    Project Progress
                  </span>

                  <span className="text-sm font-bold text-sky-600">
                    {project.progress ?? 0}%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{
                      width: `${Math.min(
                        project.progress ?? 0,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* Details */}

              <div className="mt-6 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-slate-50 p-3">

                  <div className="flex items-center gap-2 text-slate-400">
                    <FiUsers size={15} />

                    <span className="text-xs">
                      Team Members
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {project.teamMembers?.length ?? 0}
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-3">

                  <div className="flex items-center gap-2 text-slate-400">
                    <FiClock size={15} />

                    <span className="text-xs">
                      Priority
                    </span>
                  </div>

                  <span
                    className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${getPriorityStyle(
                      project.priority
                    )}`}
                  >
                    {project.priority || "medium"}
                  </span>

                </div>

              </div>

              {/* Dates + Details */}

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2 text-xs text-slate-400">

                  <FiCalendar size={14} />

                  <span>
                    {formatDate(project.startDate)}
                    {" → "}
                    {formatDate(project.endDate)}
                  </span>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/manager/projects/${project._id}`
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-sky-500"
                >
                  View Details
                  <FiArrowRight size={14} />
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default ManagerProjects;