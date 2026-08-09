const express = require("express");

const {
  addDiscussion,
  getTaskDiscussions,
  deleteDiscussion,
} = require("../controllers/discussionController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// Get Task Discussions
// ========================================

router.get(
  "/task/:taskId",
  protect,
  authorize("admin", "manager", "member"),
  getTaskDiscussions
);

// ========================================
// Add Discussion
// ========================================

router.post(
  "/task/:taskId",
  protect,
  authorize("admin", "manager", "member"),
  addDiscussion
);

// ========================================
// Delete Discussion
// ========================================

router.delete(
  "/:id",
  protect,
  authorize("admin", "manager", "member"),
  deleteDiscussion
);

module.exports = router;