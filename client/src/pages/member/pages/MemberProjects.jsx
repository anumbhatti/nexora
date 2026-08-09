import { useEffect, useState } from "react";
import {
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function MemberProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // ========================================
  // Fetch Member Projects
  // ========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status) {
        params.append("status", status);
      }

      const query = params.toString();

      const response = await api.get(
        query
          ? `/projects/member/my-projects?${query}`
          : "/projects/member/my-projects"
      );

      if (response.data.success) {
        setProjects(response.data.projects || []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Member Projects Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load projects"
      );

      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Initial Load + Status Change
  // ========================================

  useEffect(() => {
    fetchProjects();
  }, [status]);

  // ========================================
  // Search
  // ========================================

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  // ========================================
  // Stats
  // ========================================

  const totalProjects = projects.length;

  const activeProjects = projects.filter(
    (project) => project.status === "in-progress"
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "completed"
  ).length;

  const pendingProjects = projects.filter(
    (project) =>
      project.status === "planning" ||
      project.status === "on-hold"
  ).length;

  const stats = [
    {
      title: "My Projects",
      value: totalProjects,
      icon: FiFolder,
    },
    {
      title: "Active Projects",
      value: activeProjects,
      icon: FiClock,
    },
    {
      title: "Completed",
      value: completedProjects,
      icon: FiCheckCircle,
    },
    {
      title: "Pending",
      value: pendingProjects,
      icon: FiFolder,
    },
  ];

  // ========================================
  // Status Style
  // ========================================

  const getStatusStyle = (projectStatus) => {
    switch (projectStatus) {
      case "completed":
        return "bg-emerald-50 text-emerald-600";

      case "in-progress":
        return "bg-sky-50 text-sky-600";

      case "planning":
        return "bg-amber-50 text-amber-600";

      case "on-hold":
        return "bg-orange-50 text-orange-600";

      case "cancelled":
        return "bg-red-50 text-red-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ========================================
  // Format Status
  // ========================================

  const formatStatus = (projectStatus) => {
    if (!projectStatus) {
      return "Unknown";
    }

    return projectStatus
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
            Loading projects...
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

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-medium text-sky-500">
            Member Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            My Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and track the projects assigned to you.
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
          Stats
      ======================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                  <Icon size={22} />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* ========================================
          Filters
      ======================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-center gap-2">
          <FiFilter
            size={18}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-800">
            Find Projects
          </h2>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4"
        >

          {/* Search */}

          <div className="relative md:col-span-2">

            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />

          </div>

          {/* Status */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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

          <button
            type="submit"
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 md:w-fit"
          >
            Search Projects
          </button>

        </form>
      </div>

      {/* ========================================
          Assigned Projects
      ======================================== */}

      <div>

        <div className="mb-4">
          <h2 className="font-semibold text-slate-900">
            Assigned Projects
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Projects where you are part of the team.
          </p>
        </div>

        {/* Empty State */}

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiFolder size={24} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No projects found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              You don't have any projects matching your filters.
            </p>

          </div>
        ) : (

          /* Projects Grid */

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {projects.map((project) => {

              const progress = Math.min(
                Math.max(
                  Number(project.progress) || 0,
                  0
                ),
                100
              );

              return (
                <div
                  key={project._id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >

                  {/* ========================================
                      Project Header
                  ======================================== */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                        <FiFolder size={21} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate font-semibold text-slate-900">
                          {project.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {project.manager?.name
                            ? `Manager: ${project.manager.name}`
                            : "Project"}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                        project.status
                      )}`}
                    >
                      {formatStatus(project.status)}
                    </span>

                  </div>

                  {/* ========================================
                      Description
                  ======================================== */}

                  <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500">
                    {project.description ||
                      "No project description available."}
                  </p>

                  {/* ========================================
                      Progress
                  ======================================== */}

                  <div className="mt-5">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-xs font-medium text-slate-500">
                        Progress
                      </span>

                      <span className="text-xs font-semibold text-slate-700">
                        {progress}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* ========================================
                      Bottom
                  ======================================== */}

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">

                    <div className="flex items-center gap-2 text-sm text-slate-500">

                      <FiUsers size={17} />

                      <span>
                        {project.teamMembers?.length || 0} Team Members
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/member/projects/${project._id}`
                        )
                      }
                      className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700"
                    >
                      View Project
                      <FiArrowRight size={16} />
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}

export default MemberProjects;