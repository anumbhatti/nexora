import { useEffect, useState } from "react";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiMail,
  FiCheckCircle,
  FiUserX,
  FiFolder,
  FiChevronDown,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function ManagerTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // ========================================
  // Fetch Manager Team
  // ========================================

  const fetchTeam = async () => {
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
          ? `/users/manager/team?${query}`
          : "/users/manager/team"
      );

      if (response.data.success) {
        setMembers(response.data.members || []);
      } else {
        setMembers([]);

        toast.error(
          response.data.message ||
            "Failed to load team members"
        );
      }
    } catch (error) {
      console.error(
        "Manager Team Error:",
        error?.response?.data || error
      );

      setMembers([]);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load team members"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Initial Load + Status Change
  // ========================================

  useEffect(() => {
    fetchTeam();
  }, [status]);

  // ========================================
  // Search
  // ========================================

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTeam();
  };

  // ========================================
  // Refresh
  // ========================================

  const handleRefresh = () => {
    fetchTeam();
  };

  // ========================================
  // Stats
  // ========================================

  const totalMembers = members.length;

  const activeMembers = members.filter(
    (member) => member.isActive
  ).length;

  const inactiveMembers = members.filter(
    (member) => !member.isActive
  ).length;

  // ========================================
  // Helpers
  // ========================================

  const getInitial = (name) => {
    return (
      name?.charAt(0)?.toUpperCase() || "U"
    );
  };

  const getProjectStatusStyle = (projectStatus) => {
    switch (projectStatus) {
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

  const formatProjectStatus = (value) => {
    if (!value) return "Planning";

    return value
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
            <FiRefreshCw
              size={24}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Loading your team...
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
          <h1 className="text-3xl font-bold text-slate-900">
            Team
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor members working on your projects.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>

      </div>

      {/* ========================================
          Stats
      ======================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Members
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalMembers}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
              <FiUsers size={22} />
            </div>

          </div>

        </div>

        {/* Active */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Active Members
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {activeMembers}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
              <FiCheckCircle size={22} />
            </div>

          </div>

        </div>

        {/* Inactive */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Inactive Members
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {inactiveMembers}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FiUserX size={22} />
            </div>

          </div>

        </div>

      </div>

      {/* ========================================
          Search + Filter
      ======================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 lg:flex-row"
        >

          {/* Search */}

          <div className="relative flex-1">

            <FiSearch
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />

          </div>

          {/* Status */}

          <div className="relative">

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="h-11 w-full min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-600 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            >
              <option value="">
                All Members
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <FiChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

          </div>

          {/* Search Button */}

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            <FiSearch size={16} />
            Search
          </button>

        </form>

      </div>

      {/* ========================================
          Team Members
      ======================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}

        <div className="border-b border-slate-100 px-6 py-5">

          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

            <div>
              <h2 className="font-semibold text-slate-900">
                Team Members
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Members assigned to your projects.
              </p>
            </div>

            <span className="text-sm font-medium text-slate-400">
              {members.length}{" "}
              {members.length === 1
                ? "member"
                : "members"}
            </span>

          </div>

        </div>

        {/* Empty State */}

        {members.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <FiUsers size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No team members found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
              No team members match your current search or filter.
            </p>

            {(search || status) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
                className="mt-4 text-sm font-semibold text-sky-500 hover:text-sky-600"
              >
                Clear filters
              </button>
            )}

          </div>

        ) : (

          /* ========================================
             Table
          ======================================== */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Member
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Projects
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {members.map((member) => (

                  <tr
                    key={member._id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* =================================
                        Member
                    ================================= */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-600">
                          {getInitial(member.name)}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-semibold text-slate-800">
                            {member.name}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                            <FiMail size={12} />
                            <span className="truncate">
                              {member.email}
                            </span>
                          </div>

                        </div>

                      </div>

                    </td>

                    {/* =================================
                        Role
                    ================================= */}

                    <td className="px-6 py-5">

                      <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium capitalize text-slate-600">
                        {member.role || "Member"}
                      </span>

                    </td>

                    {/* =================================
                        Projects
                    ================================= */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                          <FiFolder size={15} />
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          {member.projects?.length || 0}
                        </span>

                        <span className="text-xs text-slate-400">
                          {member.projects?.length === 1
                            ? "Project"
                            : "Projects"}
                        </span>

                      </div>

                    </td>

                    {/* =================================
                        Project Status
                    ================================= */}

                    <td className="px-6 py-5">

                      <div className="flex flex-wrap gap-2">

                        {member.projects?.length ? (
                          member.projects.map(
                            (project) => (
                              <div
                                key={project._id}
                                className="flex items-center gap-2"
                              >

                                <span className="text-sm text-slate-700">
                                  {project.name}
                                </span>

                                <span
                                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getProjectStatusStyle(
                                    project.status
                                  )}`}
                                >
                                  {formatProjectStatus(
                                    project.status
                                  )}
                                </span>

                              </div>
                            )
                          )
                        ) : (
                          <span className="text-sm text-slate-400">
                            No projects
                          </span>
                        )}

                      </div>

                    </td>

                    {/* =================================
                        Member Status
                    ================================= */}

                    <td className="px-6 py-5">

                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">

                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                          Active

                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">

                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

                          Inactive

                        </span>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default ManagerTeam;