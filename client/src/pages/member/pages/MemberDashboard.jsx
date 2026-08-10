import { useEffect, useState } from "react";

import {
  FiFolder,
  FiCheckSquare,
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiTrendingUp,
  FiBell,
  FiRefreshCw,
} from "react-icons/fi";

import toast from "react-hot-toast";

import api from "../../../api/axios";

function MemberDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // Fetch Member Dashboard
  // ========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = api.get("/dashboard/member");

      if (response.data.success) {
        setDashboard(response.data.dashboard);
      }
    } catch (error) {
      console.error(
        "Member Dashboard Error:",
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
          <FiRefreshCw
            size={30}
            className="mx-auto animate-spin text-sky-500"
          />

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

          <p className="mt-2 text-sm text-slate-500">
            Something went wrong while loading your data.
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
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

  const assignedProjects =
    dashboard.assignedProjects || [];

  const upcomingDeadlines =
    dashboard.upcomingDeadlines || [];

  const recentTasks =
    dashboard.recentTasks || [];

  const notifications =
    dashboard.notifications || {};

  // ========================================
  // Stats
  // ========================================

  const stats = [
    {
      title: "My Projects",
      value: projects.total ?? 0,
      icon: FiFolder,
    },
    {
      title: "Total Tasks",
      value: tasks.total ?? 0,
      icon: FiCheckSquare,
    },
    {
      title: "Pending Tasks",
      value: tasks.pending ?? 0,
      icon: FiClock,
    },
    {
      title: "In Progress",
      value: tasks.inProgress ?? 0,
      icon: FiPlay,
    },
    {
      title: "Completed Tasks",
      value: tasks.completed ?? 0,
      icon: FiCheckCircle,
    },
    {
      title: "Task Progress",
      value: `${tasks.overallProgress ?? 0}%`,
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Overview of your projects, tasks and progress.
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
          Stats Cards
      ======================================== */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {stat.value}
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
          Progress + Notifications
      ======================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Progress */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Overall Task Progress
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {tasks.overallProgress ?? 0}%
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
              <FiTrendingUp size={22} />
            </div>

          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  tasks.overallProgress ?? 0,
                  100
                )}%`,
              }}
            />
          </div>

          <div className="mt-4 flex justify-between text-xs text-slate-400">
            <span>Task completion</span>

            <span>
              {tasks.completed ?? 0} of {tasks.total ?? 0} completed
            </span>
          </div>

        </div>

        {/* Notifications */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Unread Notifications
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {notifications.unreadCount ?? 0}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
              <FiBell size={22} />
            </div>

          </div>

          <p className="mt-4 text-sm text-slate-400">
            New updates from your projects and tasks.
          </p>

        </div>

      </div>

      {/* ========================================
          My Projects + Upcoming Deadlines
      ======================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* My Projects */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="text-lg font-semibold text-slate-900">
              My Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Projects you are currently assigned to.
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {assignedProjects.length > 0 ? (
              assignedProjects.slice(0, 5).map((project) => (
                <div
                  key={project._id}
                  className="px-6 py-5"
                >

                  <div className="flex items-center justify-between gap-4">

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

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{
                        width: `${Math.min(
                          project.progress ?? 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">

                <FiFolder
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm text-slate-400">
                  No projects assigned.
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
              Your upcoming task deadlines.
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((task) => (
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

                  <div className="shrink-0 text-right">

                    <p className="text-xs font-medium text-slate-500">
                      {task.dueDate
                        ? new Date(
                            task.dueDate
                          ).toLocaleDateString()
                        : "No date"}
                    </p>

                    <p className="mt-1 text-xs capitalize text-slate-400">
                      {task.priority || "medium"}
                    </p>

                  </div>

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

      {/* ========================================
          Recent Tasks
      ======================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="text-lg font-semibold text-slate-900">
            Recent Tasks
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your recently assigned tasks.
          </p>

        </div>

        {recentTasks.length > 0 ? (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Task
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Due Date
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {recentTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {task.title}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {task.project?.name || "—"}
                    </td>

                    <td className="px-6 py-4">

                      <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold capitalize text-sky-600">
                        {task.status?.replace("-", " ") || "To Do"}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {task.dueDate
                        ? new Date(
                            task.dueDate
                          ).toLocaleDateString()
                        : "No date"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        ) : (
          <div className="px-6 py-12 text-center">

            <FiCheckSquare
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm text-slate-400">
              No recent tasks.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default MemberDashboard;