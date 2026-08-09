import { useState } from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "./ManagerSidebar";
import ManagerTopbar from "./ManagerTopbar";

function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}
      <ManagerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="min-h-screen lg:ml-72">

        {/* Topbar */}
        <header className="sticky top-0 z-40 h-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <ManagerTopbar
              onMenuClick={() => setSidebarOpen(true)}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default ManagerLayout;