import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiEdit3,
  FiFolder,
  FiSave,
  FiUsers,
  FiUserPlus,
  FiX,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../../../api/axios";

function ManagerProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========================================
  // STATES
  // ========================================

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Team members
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Form
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    status: "planning",
  });

  // ========================================
  // FETCH PROJECT
  // ========================================

  const fetchProject = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/projects/manager/my-projects/${id}`
      );

      if (response.data.success) {
        const data = response.data.project;

        setProject(data);

        setForm({
          name: data.name || "",
          description: data.description || "",

          startDate: data.startDate
            ? data.startDate.split("T")[0]
            : "",

          endDate: data.endDate
            ? data.endDate.split("T")[0]
            : "",

          priority: data.priority || "medium",
          status: data.status || "planning",
        });
      }
    } catch (error) {
      console.error(
        "Manager Project Details Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load project"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FETCH AVAILABLE TEAM MEMBERS
  // ========================================

  const fetchAvailableMembers = async () => {
    try {
      const response = await api.get(
        `/projects/manager/my-projects/${id}/available-members`
      );

      if (response.data.success) {
        setAvailableMembers(
          response.data.users || []
        );
      }
    } catch (error) {
      console.error(
        "Fetch Available Members Error:",
        error
      );

      setAvailableMembers([]);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    if (!id) return;

    fetchProject();
    fetchAvailableMembers();
  }, [id]);

  // ========================================
  // FORM CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // UPDATE PROJECT
  // ========================================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await api.patch(
        `/projects/manager/my-projects/${id}`,
        form
      );

      if (response.data.success) {
        const updatedProject =
          response.data.project;

        setProject(updatedProject);

        setForm({
          name: updatedProject.name || "",

          description:
            updatedProject.description || "",

          startDate:
            updatedProject.startDate
              ? updatedProject.startDate.split("T")[0]
              : "",

          endDate:
            updatedProject.endDate
              ? updatedProject.endDate.split("T")[0]
              : "",

          priority:
            updatedProject.priority || "medium",

          status:
            updatedProject.status || "planning",
        });

        setEditing(false);

        toast.success(
          "Project updated successfully"
        );
      }
    } catch (error) {
      console.error(
        "Update Project Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update project"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // ADD TEAM MEMBER
  // ========================================

  const handleAddMember = async () => {
    if (!selectedMember) {
      toast.error(
        "Please select a team member"
      );

      return;
    }

    try {
      setAddingMember(true);

      const response = await api.post(
        `/projects/manager/my-projects/${id}/members`,
        {
          userId: selectedMember,
        }
      );

      if (response.data.success) {
        // Update project immediately
        setProject(response.data.project);

        // Clear dropdown
        setSelectedMember("");

        // Refresh available members
        await fetchAvailableMembers();

        toast.success(
          "Team member added successfully"
        );
      }
    } catch (error) {
      console.error(
        "Add Team Member Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to add team member"
      );
    } finally {
      setAddingMember(false);
    }
  };

  // ========================================
  // REMOVE TEAM MEMBER
  // ========================================

  const handleRemoveMember = async (userId) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this team member?"
    );

    if (!confirmRemove) return;

    try {
      const response = await api.delete(
        `/projects/manager/my-projects/${id}/members`,
        {
          data: {
            userId,
          },
        }
      );

      if (response.data.success) {
        setProject(response.data.project);

        await fetchAvailableMembers();

        toast.success(
          "Team member removed successfully"
        );
      }
    } catch (error) {
      console.error(
        "Remove Team Member Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to remove team member"
      );
    }
  };

  // ========================================
  // HELPERS
  // ========================================

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

  const getStatusStyle = (status) => {
    switch (status) {
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

  const getPriorityStyle = (priority) => {
    switch (priority) {
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

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
            <FiFolder size={22} />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Loading project...
          </p>

        </div>
      </div>
    );
  }

  // ========================================
  // PROJECT NOT FOUND
  // ========================================

  if (!project) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FiFolder size={25} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Project not found
          </h2>

          <button
            onClick={() =>
              navigate("/manager/projects")
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            <FiArrowLeft size={16} />
            Back to Projects
          </button>

        </div>

      </div>
    );
  }

  // ========================================
  // PROGRESS
  // ========================================

  const progress = project.progress ?? 0;

  // ========================================
  // UI
  // ========================================

  return (
    <div className="space-y-6">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-start gap-3">

          <button
            onClick={() =>
              navigate("/manager/projects")
            }
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <FiArrowLeft size={19} />
          </button>

          <div>

            <p className="text-sm text-slate-400">
              My Projects
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              {project.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage project information and team.
            </p>

          </div>

        </div>

        {!editing ? (

          <button
            onClick={() => setEditing(true)}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            <FiEdit3 size={16} />
            Edit Project
          </button>

        ) : (

          <button
            onClick={() => setEditing(false)}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <FiX size={16} />
            Cancel
          </button>

        )}

      </div>

      {/* ========================================
          MAIN GRID
      ======================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ======================================
            LEFT
        ====================================== */}

        <div className="space-y-6 xl:col-span-2">

          {/* ======================================
              PROJECT OVERVIEW
          ====================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Project Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Basic information about this project.
                </p>

              </div>

              <div className="flex gap-2">

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    project.status
                  )}`}
                >
                  {formatStatus(project.status)}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPriorityStyle(
                    project.priority
                  )}`}
                >
                  {project.priority}
                </span>

              </div>

            </div>

            {!editing ? (

              <div className="mt-6">

                <p className="text-sm leading-7 text-slate-600">
                  {project.description ||
                    "No project description available."}
                </p>

              </div>

            ) : (

              <form
                onSubmit={handleSave}
                className="mt-6 space-y-5"
              >

                {/* NAME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Project Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    required
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />

                </div>

                {/* DATES */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      End Date
                    </label>

                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    />

                  </div>

                </div>

                {/* PRIORITY + STATUS */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Priority
                    </label>

                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
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

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
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

                {/* SAVE */}

                <div className="flex justify-end">

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <FiSave size={16} />

                    {saving
                      ? "Saving..."
                      : "Save Changes"}

                  </button>

                </div>

              </form>

            )}

          </div>

          {/* ======================================
              PROGRESS
          ====================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Project Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current completion of the project.
                </p>

              </div>

              <span className="text-2xl font-bold text-sky-500">
                {progress}%
              </span>

            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-sky-500 transition-all"
                style={{
                  width: `${Math.min(
                    progress,
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* ======================================
            RIGHT
        ====================================== */}

        <div className="space-y-6">

          {/* ======================================
              PROJECT DETAILS
          ====================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Project Details
            </h2>

            <div className="mt-5 space-y-5">

              {/* START DATE */}

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                  <FiCalendar size={18} />
                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    Start Date
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDate(
                      project.startDate
                    )}
                  </p>

                </div>

              </div>

              {/* END DATE */}

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <FiClock size={18} />
                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    End Date
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDate(
                      project.endDate
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ======================================
              TEAM MEMBERS
          ====================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Team Members
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  People assigned to this project.
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                <FiUsers size={18} />
              </div>

            </div>

            {/* ADD MEMBER */}

            <div className="mt-5 rounded-xl bg-slate-50 p-4">

              <div className="mb-3 flex items-center gap-2">

                <FiUserPlus
                  className="text-sky-500"
                  size={16}
                />

                <p className="text-sm font-semibold text-slate-700">
                  Add Team Member
                </p>

              </div>

              <div className="flex flex-col gap-3">

                <select
                  value={selectedMember}
                  onChange={(e) =>
                    setSelectedMember(
                      e.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >

                  <option value="">
                    Select team member
                  </option>

                  {availableMembers.map(
                    (member) => (
                      <option
                        key={member._id}
                        value={member._id}
                      >
                        {member.name} -{" "}
                        {member.email}
                      </option>
                    )
                  )}

                </select>

                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={
                    addingMember ||
                    !selectedMember
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <FiUserPlus size={16} />

                  {addingMember
                    ? "Adding..."
                    : "Add Member"}

                </button>

              </div>

              {availableMembers.length ===
                0 && (

                <p className="mt-3 text-xs text-slate-400">
                  No additional team members
                  available.
                </p>

              )}

            </div>

            {/* CURRENT TEAM MEMBERS */}

            <div className="mt-5 space-y-3">

              {project.teamMembers?.length ? (

                project.teamMembers.map(
                  (member) => (

                    <div
                      key={member._id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        {/* AVATAR */}

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-600">
                          {member.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "U"}
                        </div>

                        {/* USER INFO */}

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {member.name}
                          </p>

                          <p className="truncate text-xs text-slate-400">
                            {member.email}
                          </p>

                        </div>

                      </div>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveMember(
                            member._id
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        title="Remove member"
                      >
                        <FiX size={16} />
                      </button>

                    </div>

                  )
                )

              ) : (

                <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">

                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FiUsers size={18} />
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    No team members assigned.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ManagerProjectDetails;