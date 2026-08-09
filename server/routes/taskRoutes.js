const express = require("express");

const {
  createTask,
  getManagerTasks,
  getManagerTaskById,
  updateTask,
  deleteTask,
  getMemberTasks,
  updateTaskStatus,
  getAllTasks,
} = require("../controllers/taskController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// MANAGER TASK ROUTES
// ========================================

// Create Task
router.post(
  "/",
  protect,
  authorize("manager"),
  createTask
);

// Manager - My Tasks
router.get(
  "/my-tasks",
  protect,
  authorize("manager"),
  getManagerTasks
);

// Manager - Task Details
router.get(
  "/manager/:id",
  protect,
  authorize("manager"),
  getManagerTaskById
);

// Manager - Update Task
router.patch(
  "/:id",
  protect,
  authorize("manager"),
  updateTask
);

// Manager - Delete Task
router.delete(
  "/:id",
  protect,
  authorize("manager"),
  deleteTask
);

// ========================================
// MEMBER TASK ROUTES
// ========================================

// Member - My Tasks
router.get(
  "/member/my-tasks",
  protect,
  authorize("member"),
  getMemberTasks
);

// Member - Update Task Status
router.patch(
  "/member/:id/status",
  protect,
  authorize("member"),
  updateTaskStatus
);

// ========================================
// ADMIN TASK ROUTES
// ========================================

// Admin - All Tasks
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  getAllTasks
);

module.exports = router;