import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiUsers,
  FiFolder,
  FiCheckSquare,
} from "react-icons/fi";
import api from "../../api/axios";

function AdminSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("q") || "";

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchEverything = async () => {
      try {
        setLoading(true);

        const [usersResponse, projectsResponse, tasksResponse] =
  await Promise.all([
    api.get("/users"),
    api.get("/projects"),
    api.get("/tasks/admin/all"),
  ]);

        const usersData = usersResponse.data.users || [];
        const projectsData = projectsResponse.data.projects || [];
        const tasksData = tasksResponse.data.tasks || [];

        const value = query.toLowerCase();

        setUsers(
          usersData.filter(
            (user) =>
              user.name?.toLowerCase().includes(value) ||
              user.email?.toLowerCase().includes(value) ||
              user.role?.toLowerCase().includes(value)
          )
        );

        setProjects(
          projectsData.filter(
            (project) =>
              project.name?.toLowerCase().includes(value) ||
              project.description
                ?.toLowerCase()
                .includes(value)
          )
        );

        setTasks(
          tasksData.filter(
            (task) =>
              task.title?.toLowerCase().includes(value) ||
              task.description
                ?.toLowerCase()
                .includes(value) ||
              task.project?.name
                ?.toLowerCase()
                .includes(value) ||
              task.assignedTo?.name
                ?.toLowerCase()
                .includes(value)
          )
        );
      } catch (error) {
        console.error("Global Search Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      searchEverything();
    } else {
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Searching...
        </p>
      </div>
    );
  }

  const totalResults =
    users.length + projects.length + tasks.length;

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <p className="text-sm font-medium text-sky-500">
          Global Search
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Search Results
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Results for{" "}
          <span className="font-semibold text-slate-700">
            "{query}"
          </span>
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

          <FiSearch
            size={35}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No results found
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Try searching with a different keyword.
          </p>

        </div>
      ) : (
        <div className="space-y-6">

          {/* Users */}

          {users.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <FiUsers className="text-sky-500" />

                <h2 className="font-semibold text-slate-900">
                  Users
                </h2>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                  {users.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100">

                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => navigate("/admin/users")}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 font-semibold text-sky-600">
                      {user.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {user.name}
                      </p>

                      <p className="text-sm text-slate-400">
                        {user.email}
                      </p>
                    </div>

                    <span className="ml-auto text-xs capitalize text-slate-400">
                      {user.role}
                    </span>

                  </button>
                ))}

              </div>
            </div>
          )}

          {/* Projects */}

          {projects.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <FiFolder className="text-sky-500" />

                <h2 className="font-semibold text-slate-900">
                  Projects
                </h2>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                  {projects.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100">

                {projects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => navigate("/admin/projects")}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                      <FiFolder size={18} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {project.name}
                      </p>

                      <p className="text-sm capitalize text-slate-400">
                        {project.status}
                      </p>
                    </div>

                    <span className="ml-auto text-sm font-semibold text-sky-600">
                      {project.progress || 0}%
                    </span>

                  </button>
                ))}

              </div>
            </div>
          )}

          {/* Tasks */}

          {tasks.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <FiCheckSquare className="text-sky-500" />

                <h2 className="font-semibold text-slate-900">
                  Tasks
                </h2>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                  {tasks.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100">

                {tasks.map((task) => (
                  <button
                    key={task._id}
                    onClick={() => navigate("/admin/tasks")}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                      <FiCheckSquare size={18} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {task.title}
                      </p>

                      <p className="text-sm text-slate-400">
                        {task.project?.name ||
                          "No project"}
                      </p>
                    </div>

                    <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-500">
                      {task.status?.replace(
                        "-",
                        " "
                      )}
                    </span>

                  </button>
                ))}

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default AdminSearch;