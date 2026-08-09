import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// ========================================
// Auth
// ========================================

import Login from "../pages/auth/Login";

// ========================================
// Shared Components
// ========================================

import Notifications from "../components/Notifications";

// ========================================
// Admin Layout
// ========================================

import AdminLayout from "../components/AdminLayout";

// ========================================
// Admin Pages
// ========================================

import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Projects from "../pages/admin/Projects";
import Tasks from "../pages/admin/Tasks";
import Profile from "../pages/admin/Profile";
import AdminSearch from "../pages/admin/AdminSearch";

// ========================================
// Manager Layout
// ========================================

import ManagerLayout from "../pages/manager/layout/ManagerLayout";

// ========================================
// Manager Pages
// ========================================

import ManagerDashboard from "../pages/manager/pages/ManagerDashboard";
import ManagerProjects from "../pages/manager/pages/ManagerProjects";
import ManagerProjectDetails from "../pages/manager/pages/ManagerProjectDetails";
import ManagerTasks from "../pages/manager/pages/ManagerTasks";
import ManagerTeam from "../pages/manager/pages/ManagerTeam";
import ManagerProfile from "../pages/manager/pages/ManagerProfile";

// ========================================
// Member Layout
// ========================================

import MemberLayout from "../pages/member/layout/MemberLayout";

// ========================================
// Member Pages
// ========================================

import MemberDashboard from "../pages/member/pages/MemberDashboard";
import MemberProjects from "../pages/member/pages/MemberProjects";
import MemberProjectDetails from "../pages/member/pages/MemberProjectDetails";
import MemberTasks from "../pages/member/pages/MemberTasks";
import MemberProfile from "../pages/member/pages/MemberProfile";

// ========================================
// Protection
// ========================================

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================
            PUBLIC ROUTES
        ====================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* =====================================
            ADMIN ROUTES
        ====================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* /admin */}
          <Route
            index
            element={<AdminDashboard />}
          />

          {/* /admin/users */}
          <Route
            path="users"
            element={<Users />}
          />

          {/* /admin/projects */}
          <Route
            path="projects"
            element={<Projects />}
          />

          {/* /admin/tasks */}
          <Route
            path="tasks"
            element={<Tasks />}
          />

          {/* /admin/notifications */}
          <Route
            path="notifications"
            element={<Notifications />}
          />

          {/* /admin/profile */}
          <Route
            path="profile"
            element={<Profile />}
          />

          {/* /admin/search */}
          <Route
            path="search"
            element={<AdminSearch />}
          />
        </Route>

        {/* =====================================
            MANAGER ROUTES
        ====================================== */}

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          {/* /manager */}
          <Route
            index
            element={<ManagerDashboard />}
          />

          {/* /manager/projects */}
          <Route
            path="projects"
            element={<ManagerProjects />}
          />

          {/* /manager/projects/:id */}
          <Route
            path="projects/:id"
            element={<ManagerProjectDetails />}
          />

          {/* /manager/tasks */}
          <Route
            path="tasks"
            element={<ManagerTasks />}
          />

          {/* /manager/team */}
          <Route
            path="team"
            element={<ManagerTeam />}
          />

          {/* /manager/notifications */}
          <Route
            path="notifications"
            element={<Notifications />}
          />

          {/* /manager/profile */}
          <Route
            path="profile"
            element={<ManagerProfile />}
          />
        </Route>

        {/* =====================================
            MEMBER ROUTES
        ====================================== */}

        <Route
          path="/member"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          {/* /member */}
          <Route
            index
            element={<MemberDashboard />}
          />

          {/* /member/projects */}
          <Route
            path="projects"
            element={<MemberProjects />}
          />

          {/* /member/projects/:id */}
          <Route
            path="projects/:id"
            element={<MemberProjectDetails />}
          />

          {/* /member/tasks */}
          <Route
            path="tasks"
            element={<MemberTasks />}
          />

          {/* /member/notifications */}
          <Route
            path="notifications"
            element={<Notifications />}
          />

          {/* /member/profile */}
          <Route
            path="profile"
            element={<MemberProfile />}
          />
        </Route>

        {/* =====================================
            DEFAULT ROUTE
        ====================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;