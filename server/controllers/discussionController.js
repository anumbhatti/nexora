const Discussion = require("../models/Discussion");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

// ========================================
// Helper: Check Task Access
// ========================================

const getTaskWithAccess = async (taskId, user) => {
  const task = await Task.findById(taskId).populate("project");

  if (!task) {
    return {
      task: null,
      allowed: false,
    };
  }

  // Admin can access everything
  if (user.role === "admin") {
    return {
      task,
      allowed: true,
    };
  }

  // Manager must own the project
  if (user.role === "manager") {
    const allowed =
      task.project.manager.toString() ===
      user._id.toString();

    return {
      task,
      allowed,
    };
  }

  // Member can only access assigned tasks
  if (user.role === "member") {
    const allowed =
      task.assignedTo.toString() ===
      user._id.toString();

    return {
      task,
      allowed,
    };
  }

  return {
    task,
    allowed: false,
  };
};

// ========================================
// Add Discussion
// ========================================

const addDiscussion = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Discussion message is required",
      });
    }

    const { task, allowed } = await getTaskWithAccess(
      req.params.taskId,
      req.user
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this task",
      });
    }

    const discussion = await Discussion.create({
      task: task._id,
      author: req.user._id,
      message: message.trim(),
    });

    // ========================================
// Create Discussion Notification
// ========================================

if (req.user.role === "manager") {
  // Manager commented → notify assigned member

  if (task.assignedTo) {
    await Notification.create({
      recipient: task.assignedTo,
      type: "discussion",
      title: "New Task Discussion",
      message: `New discussion added to task: ${task.title}`,
      relatedTask: task._id,
      relatedProject: task.project._id,
    });
  }
}

if (req.user.role === "member") {
  // Member commented → notify project manager

  if (task.project.manager) {
    await Notification.create({
      recipient: task.project.manager,
      type: "discussion",
      title: "New Task Discussion",
      message: `A team member added a discussion to task: ${task.title}`,
      relatedTask: task._id,
      relatedProject: task.project._id,
    });
  }
}

    const populatedDiscussion =
      await Discussion.findById(discussion._id)
        .populate("author", "name email role")
        .populate("task", "title status");

    res.status(201).json({
      success: true,
      message: "Discussion added successfully",
      discussion: populatedDiscussion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Get Task Discussions
// ========================================

const getTaskDiscussions = async (req, res) => {
  try {
    const { task, allowed } = await getTaskWithAccess(
      req.params.taskId,
      req.user
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this task",
      });
    }

    const discussions = await Discussion.find({
      task: task._id,
    })
      .populate("author", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: discussions.length,
      discussions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Delete Discussion
// ========================================

const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(
      req.params.id
    );

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Author can delete own comment
    const isAuthor =
      discussion.author.toString() ===
      req.user._id.toString();

    // Admin can delete any comment
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own discussion",
      });
    }

    await discussion.deleteOne();

    res.status(200).json({
      success: true,
      message: "Discussion deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addDiscussion,
  getTaskDiscussions,
  deleteDiscussion,
};