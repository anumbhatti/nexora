import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiX,
  FiCalendar,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../api/axios";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    status: "planning",
    manager: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // ========================================
  // Fetch Projects
  // ========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await api.get("/projects");

      if (response.data.success) {
        setProjects(response.data.projects || []);
      }
    } catch (error) {
      console.error("Projects Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Fetch Managers
  // ========================================

  const fetchManagers = async () => {
    try {
      const response = await api.get("/api/users");

      if (response.data.success) {
        const users = response.data.users || [];

        setManagers(
          users.filter(
            (user) =>
              user.role === "manager" &&
              user.isActive
          )
        );
      }
    } catch (error) {
      console.error("Managers Error:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchManagers();
  }, []);

  // ========================================
  // Search + Filters
  // ========================================

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        project.name
          ?.toLowerCase()
          .includes(searchValue) ||
        project.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        project.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        project.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    projects,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // ========================================
  // Open Create Modal
  // ========================================

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  // ========================================
  // Open Edit Modal
  // ========================================

  const openEditModal = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name || "",
      description: project.description || "",
      startDate: project.startDate
        ? project.startDate.substring(0, 10)
        : "",
      endDate: project.endDate
        ? project.endDate.substring(0, 10)
        : "",
      priority: project.priority || "medium",
      status: project.status || "planning",
      manager:
        project.manager?._id ||
        project.manager ||
        "",
    });

    setShowModal(true);
  };

  // ========================================
  // Input Change
  // ========================================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ========================================
  // Create / Update Project
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Project description is required");
      return;
    }

    if (!formData.startDate) {
      toast.error("Start date is required");
      return;
    }

    if (!formData.endDate) {
      toast.error("End date is required");
      return;
    }

    if (!formData.manager) {
      toast.error("Please select a project manager");
      return;
    }

    if (
      new Date(formData.endDate) <
      new Date(formData.startDate)
    ) {
      toast.error(
        "End date cannot be before start date"
      );
      return;
    }

    try {
      setSaving(true);

      if (editingProject) {
        const response = await api.patch(
          `/projects/${editingProject._id}`,
          formData
        );

        if (response.data.success) {
          toast.success(
            "Project updated successfully"
          );
        }
      } else {
        const response = await api.post(
          "/projects",
          formData
        );

        if (response.data.success) {
          toast.success(
            "Project created successfully"
          );
        }
      }

      setShowModal(false);
      setFormData(emptyForm);

      await fetchProjects();
    } catch (error) {
      console.error("Project Save Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to save project"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // View Project Details
  // ========================================

  const viewProject = async (project) => {
    try {
      const response = await api.get(
        `/projects/${project._id}`
      );

      if (response.data.success) {
        setSelectedProject(
          response.data.project
        );

        setShowDetails(true);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load project details"
      );
    }
  };

  // ========================================
  // Delete Project
  // ========================================

  const deleteProject = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await api.delete(
        `/projects/${project._id}`
      );

      if (response.data.success) {
        toast.success(
          "Project deleted successfully"
        );

        await fetchProjects();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete project"
      );
    }
  };

  // ========================================
  // Helpers
  // ========================================

  const getStatusClass = (status) => {
    const classes = {
      planning:
        "bg-slate-100 text-slate-600",
      "in-progress":
        "bg-sky-50 text-sky-600",
      "on-hold":
        "bg-amber-50 text-amber-600",
      completed:
        "bg-emerald-50 text-emerald-600",
      cancelled:
        "bg-red-50 text-red-500",
    };

    return (
      classes[status] ||
      "bg-slate-100 text-slate-600"
    );
  };

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />

          <p className="text-sm text-slate-500">
            Loading projects...
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
            Projects
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage projects, managers and project progress.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
        >
          <FiPlus size={18} />
          Create Project
        </button>

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
              placeholder="Search projects..."
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
            <option value="low">Low</option>
            <option value="medium">
              Medium
            </option>
            <option value="high">High</option>
            <option value="critical">
              Critical
            </option>
          </select>

          {/* Refresh */}

          <button
            onClick={fetchProjects}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <FiRefreshCw size={17} />
            Refresh
          </button>

        </div>

      </div>

      {/* =====================================
          Projects Table
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead className="border-b border-slate-100 bg-slate-50">

              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Project
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Manager
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
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr
                    key={project._id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* Project */}

                    <td className="px-6 py-4">

                      <div>
                        <p className="font-semibold text-slate-800">
                          {project.name}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-sm text-slate-400">
                          {project.description}
                        </p>
                      </div>

                    </td>

                    {/* Manager */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                          {(
                            project.manager?.name ||
                            "M"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span className="text-sm text-slate-600">
                          {project.manager?.name ||
                            "Not assigned"}
                        </span>

                      </div>

                    </td>

                    {/* Priority */}

                    <td className="px-6 py-4">

                      <span
                        className={`text-sm font-semibold capitalize ${getPriorityClass(
                          project.priority
                        )}`}
                      >
                        {project.priority}
                      </span>

                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                          project.status
                        )}`}
                      >
                        {project.status?.replace(
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
                            {project.progress || 0}%
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-sky-500 transition-all"
                            style={{
                              width: `${
                                project.progress || 0
                              }%`,
                            }}
                          />

                        </div>

                      </div>

                    </td>

                    {/* Actions */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-1">

                        <button
                          onClick={() =>
                            viewProject(project)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          title="View"
                        >
                          <FiEye size={17} />
                        </button>

                        <button
                          onClick={() =>
                            openEditModal(project)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                          title="Edit"
                        >
                          <FiEdit2 size={17} />
                        </button>

                        <button
                          onClick={() =>
                            deleteProject(project)
                          }
                          className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <FiTrash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-16 text-center"
                  >
                    <p className="font-medium text-slate-600">
                      No projects found
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
          Create / Edit Modal
      ====================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProject
                    ? "Edit Project"
                    : "Create Project"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingProject
                    ? "Update project information."
                    : "Create a new project in Nexora."}
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <FiX size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
              </div>

              {/* Description */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the project..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
              </div>

              {/* Dates */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>

                  <div className="relative">
                    <FiCalendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />

                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    End Date
                  </label>

                  <div className="relative">
                    <FiCalendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={17}
                    />

                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

              </div>

              {/* Priority + Status */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
                  >
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

              </div>

              {/* Manager */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project Manager
                </label>

                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500"
                >
                  <option value="">
                    Select manager
                  </option>

                  {managers.map((manager) => (
                    <option
                      key={manager._id}
                      value={manager._id}
                    >
                      {manager.name} —{" "}
                      {manager.email}
                    </option>
                  ))}
                </select>

                {managers.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No active managers found.
                  </p>
                )}
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingProject
                    ? "Update Project"
                    : "Create Project"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================
          Details Modal
      ====================================== */}

      {showDetails && selectedProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <p className="text-sm font-medium text-sky-500">
                  Project Details
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedProject.name}
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
                  {selectedProject.description ||
                    "No description available."}
                </p>
              </div>

              {/* Info */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Manager
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedProject.manager
                      ?.name ||
                      "Not assigned"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Priority
                  </p>

                  <p className="mt-1 font-semibold capitalize text-slate-800">
                    {selectedProject.priority}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Start Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedProject.startDate
                      ? new Date(
                          selectedProject.startDate
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    End Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedProject.endDate
                      ? new Date(
                          selectedProject.endDate
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

              </div>

              {/* Progress */}

              <div>

                <div className="mb-2 flex justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Project Progress
                  </p>

                  <p className="text-sm font-bold text-sky-600">
                    {selectedProject.progress ||
                      0}
                    %
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{
                      width: `${
                        selectedProject.progress ||
                        0
                      }%`,
                    }}
                  />
                </div>

              </div>

              {/* Team Members */}

              <div>

                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Team Members
                </p>

                {selectedProject.teamMembers
                  ?.length ? (
                  <div className="flex flex-wrap gap-2">

                    {selectedProject.teamMembers.map(
                      (member) => (
                        <span
                          key={
                            member._id ||
                            member
                          }
                          className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700"
                        >
                          {member.name ||
                            member}
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    No team members assigned.
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

export default Projects;