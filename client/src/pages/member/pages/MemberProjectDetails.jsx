import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiFolder,
  FiUsers,
  FiCalendar,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function MemberProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/projects/member/my-projects/${id}`
      );

      if (response.data.success) {
        setProject(response.data.project);
      }
    } catch (error) {
      console.error("Member Project Details Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load project"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replace("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusStyle = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={28}
            className="mx-auto animate-spin text-sky-500"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <FiFolder
            size={35}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Project not found
          </h2>

          <button
            onClick={() => navigate("/member/projects")}
            className="mt-5 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.min(
    Math.max(Number(project.progress) || 0, 0),
    100
  );

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <button
            onClick={() => navigate("/member/projects")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-sky-600"
          >
            <FiArrowLeft size={17} />
            Back to Projects
          </button>

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
              <FiFolder size={23} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {project.name}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Project details and progress
              </p>
            </div>

          </div>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
            project.status
          )}`}
        >
          {formatStatus(project.status)}
        </span>

      </div>

      {/* Main Information */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Description */}

        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Project Overview
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            {project.description ||
              "No project description available."}
          </p>

          {/* Progress */}

          <div className="mt-8">

            <div className="mb-2 flex items-center justify-between">

              <span className="text-sm font-medium text-slate-600">
                Project Progress
              </span>

              <span className="text-sm font-bold text-sky-600">
                {progress}%
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-sky-500 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* Project Information */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Project Information
          </h2>

          <div className="mt-5 space-y-5">

            {/* Manager */}

            <div className="flex items-start gap-3">

              <FiUsers
                size={19}
                className="mt-0.5 text-sky-500"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Project Manager
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {project.manager?.name || "Not assigned"}
                </p>

              </div>

            </div>

            {/* Start Date */}

            <div className="flex items-start gap-3">

              <FiCalendar
                size={19}
                className="mt-0.5 text-sky-500"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Start Date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {project.startDate
                    ? new Date(
                        project.startDate
                      ).toLocaleDateString()
                    : "Not available"}
                </p>

              </div>

            </div>

            {/* End Date */}

            <div className="flex items-start gap-3">

              <FiClock
                size={19}
                className="mt-0.5 text-sky-500"
              />

              <div>
                <p className="text-xs text-slate-400">
                  Deadline
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {project.endDate
                    ? new Date(
                        project.endDate
                      ).toLocaleDateString()
                    : "Not available"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Team Members */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="text-lg font-semibold text-slate-900">
            Team Members
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Members working on this project.
          </p>

        </div>

        {project.teamMembers?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">

            {project.teamMembers.map((member) => (

              <div
                key={member._id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-600">
                  {member.name
                    ?.charAt(0)
                    ?.toUpperCase() || "M"}
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-slate-800">
                    {member.name}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {member.email}
                  </p>

                </div>

              </div>

            ))}

          </div>
        ) : (
          <div className="px-6 py-12 text-center">

            <FiUsers
              size={30}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm text-slate-400">
              No team members assigned.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default MemberProjectDetails;