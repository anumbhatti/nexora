const express = require("express");

const {
  getAdminDashboard,
  getManagerDashboard,
  getMemberDashboard,
} = require("../controllers/dashboardController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin Dashboard
router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAdminDashboard
);

router.get(
  "/manager",
  protect,
  authorize("manager"),
  getManagerDashboard
);

router.get(
  "/member",
  protect,
  authorize("member"),
  getMemberDashboard
);

module.exports = router;