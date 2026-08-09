import { useEffect, useState } from "react";
import {
  FiCheckSquare,
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiPlus,
  FiX,
  FiCalendar,
  FiUser,
  FiFolder,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function ManagerTasks() {
  // ======================================================
  // STATES
  // ======================================================

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  // ======================================================
  // CREATE TASK FORM
  // ======================================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
  });

  // ======================================================
  // RESET FORM
  // ======================================================

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      project: "",
      assignedTo: "",
      priority: "medium",
      dueDate: "",
    });
  };

  // ======================================================
  // FETCH MANAGER TASKS
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
        query
          ? `/tasks/my-tasks?${query}`
          : "/tasks/my-tasks"
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
        "Manager Tasks Error:",
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
  // FETCH MANAGER PROJECTS
  // ======================================================

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);

      const response = await api.get(
        "/projects/manager/my-projects"
      );

      console.log(
        "MANAGER PROJECTS:",
        response.data.projects
      );

      if (response.data.success) {
        setProjects(response.data.projects || []);
      } else {
        setProjects([]);

        toast.error(
          response.data.message ||
            "Failed to load projects"
        );
      }
    } catch (error) {
      console.error(
        "Manager Projects Error:",
        error.response?.data || error
      );

      setProjects([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to load projects"
      );
    } finally {
      setProjectsLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  // ======================================================
  // FILTER CHANGE
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
  // OPEN CREATE MODAL
  // ======================================================

  const openCreateModal = async () => {
    resetForm();

    setShowCreateModal(true);

    await fetchProjects();
  };

  // ======================================================
  // CLOSE CREATE MODAL
  // ======================================================

  const closeCreateModal = () => {
    if (creating) return;

    setShowCreateModal(false);

    resetForm();
  };

  // ======================================================
  // FORM INPUT CHANGE
  // ======================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // PROJECT CHANGE
  // ======================================================

  const handleProjectChange = (e) => {
    const projectId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      project: projectId,
      assignedTo: "",
    }));
  };

  // ======================================================
  // SELECTED PROJECT
  // ======================================================

  const selectedProject = projects.find(
    (project) =>
      String(project._id) === String(formData.project)
  );

  // ======================================================
  // PROJECT TEAM MEMBERS
  // ======================================================

  const projectMembers =
    selectedProject?.teamMembers || [];

  // ======================================================
  // DEBUG SELECTED PROJECT
  // ======================================================

  useEffect(() => {
    if (selectedProject) {
      console.log(
        "SELECTED PROJECT:",
        selectedProject
      );

      console.log(
        "PROJECT TEAM MEMBERS:",
        selectedProject.teamMembers
      );
    }
  }, [selectedProject]);

  // ======================================================
  // CREATE TASK
  // ======================================================

  const handleCreateTask = async (e) => {
    e.preventDefault();

    // ----------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------

    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Task description is required");
      return;
    }

    if (!formData.project) {
      toast.error("Please select a project");
      return;
    }

    if (!formData.assignedTo) {
      toast.error("Please select a team member");
      return;
    }

    if (!formData.dueDate) {
      toast.error("Please select a due date");
      return;
    }

    // ----------------------------------------------------
    // CHECK MEMBER
    // ----------------------------------------------------

    const memberExists = projectMembers.some(
      (member) =>
        String(member._id) ===
        String(formData.assignedTo)
    );

    if (!memberExists) {
      toast.error(
        "Selected team member does not belong to this project"
      );

      return;
    }

    // ----------------------------------------------------
    // CREATE TASK
    // ----------------------------------------------------

    try {
      setCreating(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: formData.project,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        dueDate: formData.dueDate,
      };

      console.log(
        "CREATE TASK PAYLOAD:",
        payload
      );

      const response = await api.post(
        "/tasks",
        payload
      );

      console.log(
        "CREATE TASK RESPONSE:",
        response.data
      );

      if (response.data.success) {
        toast.success(
          "Task created successfully"
        );

        setShowCreateModal(false);

        resetForm();

        await fetchTasks();
        await fetchProjects();
      } else {
        toast.error(
          response.data.message ||
            "Failed to create task"
        );
      }
    } catch (error) {
      console.error(
        "Create Task Error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create task"
      );
    } finally {
      setCreating(false);
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
        return "bg-amber-50 text-amber-600";

      case "todo":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
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
            Manage and monitor tasks across your projects.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* REFRESH */}

          <button
            onClick={fetchTasks}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FiRefreshCw size={16} />

            Refresh
          </button>

          {/* CREATE TASK */}

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            <FiPlus size={17} />

            Create Task
          </button>

        </div>
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

          {/* SEARCH */}

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

          {/* STATUS */}

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

          {/* PRIORITY */}

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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

          {/* SEARCH BUTTON */}

          <button
            type="submit"
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 md:col-span-4 md:w-fit"
          >
            Search Tasks
          </button>

        </form>

      </div>

      {/* ==================================================
          TASK TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Task List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tasks assigned within your projects.
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
              There are no tasks matching your current filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Task
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Assigned To
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

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {tasks.map((task) => (

                  <tr
                    key={task._id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* TASK */}

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

                    {/* PROJECT */}

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {task.project?.name || "—"}
                    </td>

                    {/* ASSIGNED TO */}

                    <td className="px-6 py-4">

                      <p className="text-sm font-medium text-slate-700">
                        {task.assignedTo?.name ||
                          "Unassigned"}
                      </p>

                      {task.assignedTo?.email && (
                        <p className="mt-1 text-xs text-slate-400">
                          {task.assignedTo.email}
                        </p>
                      )}

                    </td>

                    {/* PRIORITY */}

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority || "low"}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        {formatStatus(task.status)}
                      </span>

                    </td>

                    {/* DUE DATE */}

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

        )}

      </div>

      {/* ==================================================
          CREATE TASK MODAL
      ================================================== */}

      {showCreateModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          {/* ==================================================
              MODAL CONTAINER
          ================================================== */}

          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Create New Task
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign a task to a member of your project.
                </p>

              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={creating}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiX size={20} />
              </button>

            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleCreateTask}
              className="flex min-h-0 flex-1 flex-col"
            >

              {/* ==================================================
                  SCROLLABLE FORM CONTENT
              ================================================== */}

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">

                <div className="space-y-5">

                  {/* ==================================================
                      TITLE
                  ================================================== */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Task Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Build login page"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    />

                  </div>

                  {/* ==================================================
                      DESCRIPTION
                  ================================================== */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Describe what needs to be completed..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    />

                  </div>

                  {/* ==================================================
                      PROJECT + ASSIGNED TO
                  ================================================== */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* PROJECT */}

                    <div>

                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                        <FiFolder
                          size={15}
                          className="text-sky-500"
                        />

                        Project

                      </label>

                      <select
                        name="project"
                        value={formData.project}
                        onChange={handleProjectChange}
                        disabled={projectsLoading}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        <option value="">
                          {projectsLoading
                            ? "Loading projects..."
                            : "Select project"}
                        </option>

                        {projects.map((project) => (

                          <option
                            key={project._id}
                            value={project._id}
                          >
                            {project.name}
                          </option>

                        ))}

                      </select>

                    </div>

                    {/* ASSIGNED TO */}

                    <div>

                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                        <FiUser
                          size={15}
                          className="text-sky-500"
                        />

                        Assign To

                      </label>

                      <select
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        disabled={
                          !formData.project ||
                          projectMembers.length === 0
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        <option value="">

                          {!formData.project
                            ? "Select project first"
                            : projectMembers.length === 0
                            ? "No team members"
                            : "Select team member"}

                        </option>

                        {projectMembers.map(
                          (member) => (

                            <option
                              key={member._id}
                              value={member._id}
                            >

                              {member.name}

                              {member.email
                                ? ` (${member.email})`
                                : ""}

                            </option>

                          )
                        )}

                      </select>

                    </div>

                  </div>

                  {/* ==================================================
                      PRIORITY + DUE DATE
                  ================================================== */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* PRIORITY */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Priority
                      </label>

                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      >

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

                    {/* DUE DATE */}

                    <div>

                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">

                        <FiCalendar
                          size={15}
                          className="text-sky-500"
                        />

                        Due Date

                      </label>

                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        min={
                          new Date()
                            .toISOString()
                            .split("T")[0]
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                      />

                    </div>

                  </div>

                  {/* ==================================================
                      SELECTED PROJECT INFO
                  ================================================== */}

                  {selectedProject && (

                    <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-sm font-semibold text-sky-700">
                            {selectedProject.name}
                          </p>

                          <p className="mt-1 text-xs text-sky-600">

                            {projectMembers.length} team member
                            {projectMembers.length !== 1
                              ? "s"
                              : ""}{" "}
                            available for assignment

                          </p>

                        </div>

                        <FiUser
                          size={20}
                          className="text-sky-500"
                        />

                      </div>

                    </div>

                  )}

                </div>

              </div>

              {/* ==================================================
                  MODAL FOOTER
              ================================================== */}

              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">

                {/* CANCEL */}

                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                {/* CREATE TASK */}

                <button
                  type="submit"
                  disabled={
                    creating ||
                    !formData.title.trim() ||
                    !formData.description.trim() ||
                    !formData.project ||
                    !formData.assignedTo ||
                    !formData.dueDate
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {creating ? (
                    <>
                      <FiRefreshCw
                        size={16}
                        className="animate-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <FiPlus size={17} />

                      Create Task
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default ManagerTasks;