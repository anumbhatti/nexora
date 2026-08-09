import { useEffect, useState } from "react";
import {
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiClock,
  FiTrendingUp,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // Fetch Dashboard
  // ========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = api.get("/api/dashboard/admin")

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error(
        "Admin Dashboard Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load dashboard"
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
        <div className="text-center">

          <h2 className="text-lg font-semibold text-slate-800">
            Unable to load dashboard
          </h2>

          <button
            onClick={fetchDashboard}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            <FiRefreshCw size={16} />
            Try Again
          </button>

        </div>
      </div>
    );
  }

  // ========================================
  // Data
  // ========================================

  const users = dashboard.users || {};
  const projects = dashboard.projects || {};
  const tasks = dashboard.tasks || {};

  // ========================================
  // Stats Cards
  // ========================================

  const cards = [
    {
      title: "Total Users",
      value: users.total ?? 0,
      icon: FiUsers,
    },
    {
      title: "Total Projects",
      value: projects.total ?? 0,
      icon: FiFolder,
    },
    {
      title: "Total Tasks",
      value: tasks.total ?? 0,
      icon: FiCheckSquare,
    },
    {
      title: "Active Projects",
      value: projects.active ?? 0,
      icon: FiTrendingUp,
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
  ];

  return (
    <div className="space-y-8">

      {/* ========================================
          Header
      ======================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-medium text-sky-500">
            Administrator Portal
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your Nexora workspace.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* ========================================
          Stats
      ======================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {card.value}
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
          Extra Overview
      ======================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Users
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {users.active ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Overall Project Progress
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {projects.overallProgress ?? 0}%
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Completed Tasks
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {tasks.completed ?? 0}
          </p>
        </div>

      </div>

      {/* ========================================
          Projects + Deadlines
      ======================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Recent Projects */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Recent Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest projects in the system.
            </p>
          </div>

          <div className="divide-y divide-slate-100">

            {dashboard.recentProjects?.length ? (
              dashboard.recentProjects.map(
                (project) => (
                  <div
                    key={project._id}
                    className="flex items-center justify-between px-6 py-4"
                  >

                    <div>
                      <p className="font-medium text-slate-800">
                        {project.name}
                      </p>

                      <p className="mt-1 text-xs capitalize text-slate-400">
                        {project.status?.replace(
                          "-",
                          " "
                        )}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-sky-600">
                      {project.progress ?? 0}%
                    </span>

                  </div>
                )
              )
            ) : (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                No projects available.
              </div>
            )}

          </div>

        </div>

        {/* Upcoming Deadlines */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-semibold text-slate-900">
              Upcoming Deadlines
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tasks approaching their deadlines.
            </p>
          </div>

          <div className="divide-y divide-slate-100">

            {dashboard.upcomingDeadlines?.length ? (
              dashboard.upcomingDeadlines.map(
                (task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between px-6 py-4"
                  >

                    <div>
                      <p className="font-medium text-slate-800">
                        {task.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {task.project?.name ||
                          "Project"}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      {task.dueDate
                        ? new Date(
                            task.dueDate
                          ).toLocaleDateString()
                        : "No date"}
                    </span>

                  </div>
                )
              )
            ) : (
              <div className="px-6 py-10 text-center text-sm text-slate-400">
                No upcoming deadlines.
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;