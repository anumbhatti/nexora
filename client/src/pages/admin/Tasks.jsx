import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiX,
  FiCalendar,
  FiUser,
  FiFolder,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios";

function Tasks() {
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search from Topbar URL parameter
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showDetails, setShowDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ========================================
  // Sync Search With URL
  // ========================================

  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearch(query);
  }, [searchParams]);

  // ========================================
  // Fetch All Tasks
  // ========================================

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tasks/admin/all");

      if (response.data.success) {
        setTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error("Tasks Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ========================================
  // Search + Filters
  // ========================================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        task.title
          ?.toLowerCase()
          .includes(searchValue) ||
        task.description
          ?.toLowerCase()
          .includes(searchValue) ||
        task.project?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        task.assignedTo?.name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // ========================================
  // View Details
  // ========================================

  const viewTask = (task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  // ========================================
  // Status Classes
  // ========================================

  const getStatusClass = (status) => {
    const classes = {
      todo: "bg-slate-100 text-slate-600",

      "in-progress":
        "bg-sky-50 text-sky-600",

      review:
        "bg-amber-50 text-amber-600",

      completed:
        "bg-emerald-50 text-emerald-600",
    };

    return (
      classes[status] ||
      "bg-slate-100 text-slate-600"
    );
  };

  // ========================================
  // Priority Classes
  // ========================================

  const getPriorityClass = (priority) => {
    const classes = {
      low: "text-slate-500",
      medium: "text-sky-600",
      high: "text-orange-500",
      critical: "text-red-500",
    };

    return (
      classes[priority] ||
      "text-slate-500"
    );
  };

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-sky-500" />

          <p className="text-sm text-slate-500">
            Loading tasks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* =====================================
          Header
      ====================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-medium text-sky-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor all tasks across Nexora projects.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <FiRefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* =====================================
          Summary Cards
      ====================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Tasks
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {tasks.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            To Do
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-600">
            {
              tasks.filter(
                (task) => task.status === "todo"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            In Progress
          </p>

          <h2 className="mt-2 text-2xl font-bold text-sky-600">
            {
              tasks.filter(
                (task) =>
                  task.status === "in-progress"
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Completed
          </p>

          <h2 className="mt-2 text-2xl font-bold text-emerald-600">
            {
              tasks.filter(
                (task) =>
                  task.status === "completed"
              ).length
            }
          </h2>
        </div>

      </div>

      {/* =====================================
          Filters
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <FiSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tasks, projects or members..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
            />

          </div>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
          >
            <option value="all">
              All Statuses
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
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-sky-500"
          >
            <option value="all">
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

      {/* =====================================
          Tasks Table
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead className="border-b border-slate-100 bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Task
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Project
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Assigned To
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Priority
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Progress
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* Task */}

                    <td className="px-6 py-4">

                      <div className="max-w-[240px]">

                        <p className="truncate font-semibold text-slate-800">
                          {task.title}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-400">
                          {task.description}
                        </p>

                      </div>

                    </td>

                    {/* Project */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                          <FiFolder size={15} />
                        </div>

                        <span className="text-sm font-medium text-slate-600">
                          {task.project?.name ||
                            "Unknown"}
                        </span>

                      </div>

                    </td>

                    {/* Assigned Member */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {(
                            task.assignedTo?.name ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span className="text-sm text-slate-600">
                          {task.assignedTo?.name ||
                            "Unassigned"}
                        </span>

                      </div>

                    </td>

                    {/* Priority */}

                    <td className="px-6 py-4">

                      <span
                        className={`text-sm font-semibold capitalize ${getPriorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          task.status
                        )}`}
                      >
                        {task.status?.replace(
                          "-",
                          " "
                        )}
                      </span>

                    </td>

                    {/* Progress */}

                    <td className="px-6 py-4">

                      <div className="w-32">

                        <div className="mb-1 flex justify-between text-xs">

                          <span className="text-slate-400">
                            Progress
                          </span>

                          <span className="font-semibold text-slate-600">
                            {task.progress || 0}%
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-sky-500 transition-all"
                            style={{
                              width: `${
                                task.progress || 0
                              }%`,
                            }}
                          />

                        </div>

                      </div>

                    </td>

                    {/* Action */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end">

                        <button
                          onClick={() =>
                            viewTask(task)
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-sky-50 hover:text-sky-600"
                          title="View Task"
                        >
                          <FiEye size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-16 text-center"
                  >

                    <p className="font-medium text-slate-600">
                      No tasks found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search or filters.
                    </p>

                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================
          Task Details Modal
      ====================================== */}

      {showDetails && selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <p className="text-sm font-medium text-sky-500">
                  Task Details
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedTask.title}
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowDetails(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <FiX size={20} />
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* Description */}

              <div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </p>

                <p className="text-sm leading-6 text-slate-600">
                  {selectedTask.description ||
                    "No description available."}
                </p>

              </div>

              {/* Main Information */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* Project */}

                <div className="rounded-xl bg-slate-50 p-4">

                  <div className="flex items-center gap-2 text-slate-400">
                    <FiFolder size={15} />

                    <p className="text-xs">
                      Project
                    </p>
                  </div>

                  <p className="mt-2 font-semibold text-slate-800">
                    {selectedTask.project?.name ||
                      "Unknown"}
                  </p>

                </div>

                {/* Assigned */}

                <div className="rounded-xl bg-slate-50 p-4">

                  <div className="flex items-center gap-2 text-slate-400">
                    <FiUser size={15} />

                    <p className="text-xs">
                      Assigned To
                    </p>
                  </div>

                  <p className="mt-2 font-semibold text-slate-800">
                    {selectedTask.assignedTo?.name ||
                      "Unassigned"}
                  </p>

                </div>

                {/* Priority */}

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Priority
                  </p>

                  <p
                    className={`mt-2 font-semibold capitalize ${getPriorityClass(
                      selectedTask.priority
                    )}`}
                  >
                    {selectedTask.priority}
                  </p>

                </div>

                {/* Status */}

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                      selectedTask.status
                    )}`}
                  >
                    {selectedTask.status?.replace(
                      "-",
                      " "
                    )}
                  </span>

                </div>

              </div>

              {/* Due Date */}

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <FiCalendar size={18} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Due Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {selectedTask.dueDate
                        ? new Date(
                            selectedTask.dueDate
                          ).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "No due date"}
                    </p>

                  </div>

                </div>

              </div>

              {/* Progress */}

              <div>

                <div className="mb-2 flex justify-between">

                  <p className="text-sm font-semibold text-slate-700">
                    Task Progress
                  </p>

                  <p className="text-sm font-bold text-sky-600">
                    {selectedTask.progress || 0}%
                  </p>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{
                      width: `${
                        selectedTask.progress || 0
                      }%`,
                    }}
                  />

                </div>

              </div>

              {/* Created By */}

              <div className="border-t border-slate-100 pt-5">

                <p className="text-xs text-slate-400">
                  Created By
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedTask.createdBy?.name ||
                    "Unknown"}
                </p>

                {selectedTask.createdBy?.email && (
                  <p className="mt-1 text-xs text-slate-400">
                    {selectedTask.createdBy.email}
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Tasks;