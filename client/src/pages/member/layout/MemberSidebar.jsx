import {
  FiGrid,
  FiFolder,
  FiCheckSquare,
  FiBell,
  FiUser,
  FiLogOut,
  FiX,
} from "react-icons/fi";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const menuItems = [
  {
    label: "Dashboard",
    path: "/member",
    icon: FiGrid,
  },
  {
    label: "My Projects",
    path: "/member/projects",
    icon: FiFolder,
  },
  {
    label: "My Tasks",
    path: "/member/tasks",
    icon: FiCheckSquare,
  },
  {
    label: "Notifications",
    path: "/member/notifications",
    icon: FiBell,
  },
  {
    label: "Profile",
    path: "/member/profile",
    icon: FiUser,
  },
];

function MemberSidebar({ open, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold">
              N
            </div>

            {/* Brand */}
            <div>
              <h1 className="text-xl font-bold">
                Nexora
              </h1>

              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                Member Portal
              </p>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-white lg:hidden"
          >
            <FiX size={21} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/member"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <FiLogOut size={19} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default MemberSidebar;