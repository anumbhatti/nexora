import { useEffect, useState } from "react";
import {
  FiFolder,
  FiCheckSquare,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function ManagerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // Fetch Dashboard
  // ========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = api.get("/api/dashboard/manager")

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error("Manager Dashboard Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load manager dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

          <p className="mt-4 text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // Error
  // ========================================

  if (!dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Unable to load dashboard
          </h2>

          <button
            onClick={fetchDashboard}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            <FiRefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // Dashboard Data
  // ========================================

  const projects = dashboard.projects || {};
  const tasks = dashboard.tasks || {};
  const team = dashboard.team || {};

  // ========================================
  // Stats Cards
  // ========================================

  const cards = [
    {
      title: "Total Projects",
      value: projects.total ?? 0,
      icon: FiFolder,
    },
    {
      title: "Active Projects",
      value: projects.active ?? 0,
      icon: FiTrendingUp,
    },
    {
      title: "Team Members",
      value: team.total ?? 0,
      icon: FiUsers,
    },
    {
      title: "Completed Projects",
      value: projects.completed ?? 0,
      icon: FiCheckSquare,
    },
    {
      title: "Pending Tasks",
      value: tasks.todo ?? 0,
      icon: FiClock,
    },
    {
      title: "Overall Progress",
      value: `${projects.overallProgress ?? 0}%`,
      icon: FiTrendingUp,
    },
  ];

  return (
    <div className="space-y-8">

      {/* ========================================
          Header
      ======================================== */}

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-medium text-sky-500">
            Project Manager Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Overview of your projects, team and progress.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FiRefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* ========================================
          Main Stats
      ======================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                  <Icon size={25} />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* ========================================
          Additional Overview
      ======================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* Active Projects */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Active Projects
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {projects.active ?? 0}
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{
                width: `${
                  projects.total
                    ? Math.min(
                        ((projects.active ?? 0) /
                          projects.total) *
                          100,
                        100
                      )
                    : 0
                }%`,
              }}
            />
          </div>

        </div>

        {/* Team Members */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Team Members
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {team.total ?? 0}
          </p>

          <p className="mt-3 text-sm text-slate-400">
            Members assigned to your projects
          </p>

        </div>

        {/* Overall Progress */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Overall Project Progress
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {projects.overallProgress ?? 0}%
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{
                width: `${Math.min(
                  projects.overallProgress ?? 0,
                  100
                )}%`,
              }}
            />
          </div>

        </div>

      </div>

      {/* ========================================
          Recent Projects + Upcoming Deadlines
      ======================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Recent Projects */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-900">
              Recent Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest assigned projects.
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {dashboard.recentProjects?.length ? (
              dashboard.recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between gap-4 px-6 py-5"
                >
                  <div className="min-w-0">

                    <p className="truncate font-medium text-slate-800">
                      {project.name}
                    </p>

                    <p className="mt-1 text-xs capitalize text-slate-400">
                      {project.status?.replace("-", " ")}
                    </p>

                  </div>

                  <span className="shrink-0 text-sm font-semibold text-sky-600">
                    {project.progress ?? 0}%
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">

                <FiFolder
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-400">
                  No projects available.
                </p>

              </div>
            )}

          </div>
        </div>

        {/* Upcoming Deadlines */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-900">
              Upcoming Deadlines
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tasks approaching their deadlines.
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {dashboard.upcomingDeadlines?.length ? (
              dashboard.upcomingDeadlines.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-4 px-6 py-5"
                >
                  <div className="min-w-0">

                    <p className="truncate font-medium text-slate-800">
                      {task.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {task.project?.name || "Project"}
                    </p>

                  </div>

                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {task.dueDate
                      ? new Date(
                          task.dueDate
                        ).toLocaleDateString()
                      : "No date"}
                  </span>

                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">

                <FiClock
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-400">
                  No upcoming deadlines.
                </p>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default ManagerDashboard;