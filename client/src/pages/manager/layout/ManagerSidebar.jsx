import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiFolder,
  FiCheckSquare,
  FiUsers,
  FiBell,
  FiUser,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";

function ManagerSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      path: "/manager",
      icon: FiGrid,
      end: true,
    },
    {
      name: "Projects",
      path: "/manager/projects",
      icon: FiFolder,
    },
    {
      name: "Tasks",
      path: "/manager/tasks",
      icon: FiCheckSquare,
    },
    {
      name: "Team",
      path: "/manager/team",
      icon: FiUsers,
    },
    {
      name: "Notifications",
      path: "/manager/notifications",
      icon: FiBell,
    },
    {
      name: "Profile",
      path: "/manager/profile",
      icon: FiUser,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold shadow-lg shadow-sky-500/20">
              N
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-wide">
                Nexora
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Manager Portal
              </p>
            </div>

          </div>

          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <FiX size={20} />
          </button>

        </div>

        

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>

          <div className="space-y-1.5">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={19}
                        className={
                          isActive
                            ? "text-white"
                            : "text-slate-500 group-hover:text-slate-300"
                        }
                      />

                      <span>{item.name}</span>

                      
                    </>
                  )}
                </NavLink>
              );
            })}

          </div>

        </nav>

        {/* Bottom */}
        <div className="border-t border-white/10 p-4">

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <FiLogOut size={19} />
            Logout
          </button>

        </div>
      </aside>
    </>
  );
}

export default ManagerSidebar;