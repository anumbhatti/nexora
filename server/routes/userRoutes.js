const express = require("express");

const {
  getMyProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  changePassword,
  getManagerTeam,
} = require("../controllers/userController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==============================
// Current User
// ==============================

router.get(
  "/profile",
  protect,
  getMyProfile
);

router.patch(
  "/change-password",
  protect,
  changePassword
);

// ==============================
// Manager Team
// ==============================

router.get(
  "/manager/team",
  protect,
  authorize("manager"),
  getManagerTeam
);

// ==============================
// Admin User Management
// ==============================

router.get(
  "/",
  protect,
  authorize("admin"),
  getAllUsers
);

router.get(
  "/:id",
  protect,
  authorize("admin"),
  getUserById
);

router.post(
  "/",
  protect,
  authorize("admin"),
  createUser
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  updateUser
);

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  toggleUserStatus
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);

module.exports = router;