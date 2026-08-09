const express = require("express");

const {
  // Admin
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,

  // Manager
  getManagerProjects,
  getManagerProjectById,
  updateManagerProject,
  addTeamMember,
  removeTeamMember,
  getAvailableTeamMembers,

  // Member
  getMemberProjects,
  getMemberProjectById,
} = require("../controllers/projectController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// MEMBER ROUTES
// ======================================================

// Get projects assigned to logged-in member
router.get(
  "/member/my-projects",
  protect,
  authorize("member"),
  getMemberProjects
);

// Get single project assigned to logged-in member
router.get(
  "/member/my-projects/:id",
  protect,
  authorize("member"),
  getMemberProjectById
);

// ======================================================
// MANAGER ROUTES
// ======================================================

// Get manager's projects
router.get(
  "/manager/my-projects",
  protect,
  authorize("manager"),
  getManagerProjects
);

// Get single manager project
router.get(
  "/manager/my-projects/:id",
  protect,
  authorize("manager"),
  getManagerProjectById
);

// Update manager project
router.patch(
  "/manager/my-projects/:id",
  protect,
  authorize("manager"),
  updateManagerProject
);

// Get available members
router.get(
  "/manager/my-projects/:id/available-members",
  protect,
  authorize("manager"),
  getAvailableTeamMembers
);

// Add team member
router.post(
  "/manager/my-projects/:id/members",
  protect,
  authorize("manager"),
  addTeamMember
);

// Remove team member
router.delete(
  "/manager/my-projects/:id/members",
  protect,
  authorize("manager"),
  removeTeamMember
);

// ======================================================
// ADMIN ROUTES
// ======================================================

// Create project
router.post(
  "/",
  protect,
  authorize("admin"),
  createProject
);

// Get all projects
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllProjects
);

// Get single project
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getProjectById
);

// Update project
router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateProject
);

// Delete project
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteProject
);

module.exports = router;