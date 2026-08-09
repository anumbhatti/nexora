import { useEffect, useState } from "react";
import {
  FiCheckSquare,
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function MemberTasks() {
  // ======================================================
  // STATES
  // ======================================================

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  // ======================================================
  // FETCH MEMBER TASKS
  // ======================================================

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status) {
        params.append("status", status);
      }

      if (priority) {
        params.append("priority", priority);
      }

      const query = params.toString();

      const response = await api.get(
        `/tasks/member/my-tasks${query ? `?${query}` : ""}`
      );

      if (response.data.success) {
        setTasks(response.data.tasks || []);
      } else {
        setTasks([]);

        toast.error(
          response.data.message || "Failed to load tasks"
        );
      }
    } catch (error) {
      console.error(
        "Member Tasks Error:",
        error.response?.data || error
      );

      setTasks([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD + FILTER
  // ======================================================

  useEffect(() => {
    fetchTasks();
  }, [status, priority]);

  // ======================================================
  // SEARCH
  // ======================================================

  const handleSearch = (e) => {
    e.preventDefault();

    fetchTasks();
  };

  // ======================================================
  // UPDATE TASK STATUS
  // ======================================================

  const handleStatusChange = async (
    taskId,
    newStatus
  ) => {
    try {
      setUpdatingTask(taskId);

      const response = await api.patch(
        `/tasks/member/${taskId}/status`,
        {
          status: newStatus,
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message ||
            "Task status updated successfully"
        );

        // Update task immediately in UI
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId
              ? {
                  ...task,
                  status: newStatus,
                  project:
                    response.data.task?.project ||
                    task.project,
                }
              : task
          )
        );
      } else {
        toast.error(
          response.data.message ||
            "Failed to update task"
        );
      }
    } catch (error) {
      console.error(
        "Update Task Status Error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update task status"
      );
    } finally {
      setUpdatingTask(null);
    }
  };

  // ======================================================
  // STATS
  // ======================================================

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const reviewTasks = tasks.filter(
    (task) => task.status === "review"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: FiCheckSquare,
    },
    {
      title: "To Do",
      value: todoTasks,
      icon: FiClock,
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: FiPlay,
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: FiCheckCircle,
    },
  ];

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusStyle = (taskStatus) => {
    switch (taskStatus) {
      case "completed":
        return "bg-emerald-50 text-emerald-600";

      case "in-progress":
        return "bg-sky-50 text-sky-600";

      case "review":
        return "bg-violet-50 text-violet-600";

      case "todo":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ======================================================
  // FORMAT STATUS
  // ======================================================

  const formatStatus = (taskStatus) => {
    if (!taskStatus) {
      return "To Do";
    }

    return taskStatus
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // ======================================================
  // PRIORITY STYLE
  // ======================================================

  const getPriorityStyle = (taskPriority) => {
    switch (taskPriority) {
      case "critical":
        return "bg-red-50 text-red-600";

      case "high":
        return "bg-orange-50 text-orange-600";

      case "medium":
        return "bg-amber-50 text-amber-600";

      case "low":
        return "bg-emerald-50 text-emerald-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={28}
            className="mx-auto animate-spin text-sky-500"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading tasks...
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            My Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage the tasks assigned to you.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* ==================================================
          STATS
      ================================================== */}

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
                  <p className="text-sm text-slate-500">
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

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-center gap-2">
          <FiFilter
            size={18}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-800">
            Find Tasks
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
              placeholder="Search tasks..."
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
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          >
            <option value="">
              All Status
            </option>

            <option value="todo">
              To Do
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="review">
              Review
            </option>

            <option value="completed">
              Completed
            </option>
          </select>

          {/* Priority */}

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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

          {/* Search Button */}

          <button
            type="submit"
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 md:col-span-4 md:w-fit"
          >
            Search Tasks
          </button>

        </form>

      </div>

      {/* ==================================================
          TASK LIST
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Task List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tasks assigned to you by your project managers.
          </p>

        </div>

        {tasks.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiCheckSquare size={24} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No tasks found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              You currently have no tasks matching these filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Task
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Due Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Update
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {tasks.map((task) => {

                  const isUpdating =
                    updatingTask === task._id;

                  const isCompleted =
                    task.status === "completed";

                  return (
                    <tr
                      key={task._id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Task */}

                      <td className="px-6 py-4">

                        <p className="font-medium text-slate-800">
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                            {task.description}
                          </p>
                        )}

                      </td>

                      {/* Project */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {task.project?.name || "—"}
                      </td>

                      {/* Priority */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority || "low"}
                        </span>

                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                            task.status
                          )}`}
                        >
                          {formatStatus(task.status)}
                        </span>

                      </td>

                      {/* Due Date */}

                      <td className="px-6 py-4 text-sm text-slate-500">

                        {task.dueDate
                          ? new Date(
                              task.dueDate
                            ).toLocaleDateString()
                          : "No date"}

                      </td>

                      {/* Update */}

                      <td className="px-6 py-4">

                        <select
                          value={
                            task.status || "todo"
                          }
                          onChange={(e) =>
                            handleStatusChange(
                              task._id,
                              e.target.value
                            )
                          }
                          disabled={
                            isCompleted ||
                            isUpdating
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >

                          <option value="todo">
                            To Do
                          </option>

                          <option value="in-progress">
                            In Progress
                          </option>

                          <option value="review">
                            Review
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                        </select>

                        {isUpdating && (
                          <FiRefreshCw
                            size={14}
                            className="ml-2 inline animate-spin text-sky-500"
                          />
                        )}

                        {isCompleted && (
                          <span className="ml-2 text-xs font-medium text-emerald-600">
                            Completed
                          </span>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default MemberTasks;