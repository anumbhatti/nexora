import { Outlet } from "react-router-dom";
import MemberSidebar from "./MemberSidebar";
import MemberTopbar from "./MemberTopbar";

function MemberLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ========================================
          Sidebar
      ======================================== */}

      <MemberSidebar />

      {/* ========================================
          Main Content Area
      ======================================== */}

      <div className="ml-[240px] min-h-screen">

        {/* ========================================
            Topbar
        ======================================== */}

        <MemberTopbar />

        {/* ========================================
            Page Content
        ======================================== */}

        <main className="p-6 sm:p-8 lg:p-10">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MemberLayout;