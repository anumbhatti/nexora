const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const Notification = require("../models/Notification");
const updateProjectProgress = require("../utils/projectProgress");

// ======================================================
// CREATE TASK - MANAGER
// ======================================================

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
    } = req.body;

    if (
      !title ||
      !description ||
      !project ||
      !assignedTo ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, project, assigned member and due date are required",
      });
    }

    // ==================================================
    // CHECK PROJECT
    // ==================================================

    const projectData = await Project.findOne({
      _id: project,
      manager: req.user._id,
    });

    if (!projectData) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you are not assigned to this project",
      });
    }

    // ==================================================
    // CHECK MEMBER
    // ==================================================

    const member = await User.findById(
      assignedTo
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message:
          "Assigned team member not found",
      });
    }

    if (member.role !== "member") {
      return res.status(400).json({
        success: false,
        message:
          "Tasks can only be assigned to team members",
      });
    }

    if (!member.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Assigned team member is inactive",
      });
    }

    // ==================================================
    // CHECK PROJECT MEMBER
    // ==================================================

    const isProjectMember =
      projectData.teamMembers.some(
        (memberId) =>
          memberId.toString() ===
          assignedTo.toString()
      );

    if (!isProjectMember) {
      return res.status(400).json({
        success: false,
        message:
          "This team member does not belong to the selected project",
      });
    }

    // ==================================================
    // VALIDATE PRIORITY
    // ==================================================

    if (
      priority &&
      ![
        "low",
        "medium",
        "high",
        "critical",
      ].includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    // ==================================================
    // VALIDATE DUE DATE
    // ==================================================

    const deadline = new Date(dueDate);

    if (Number.isNaN(deadline.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    if (deadline < new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Due date cannot be in the past",
      });
    }

    // ==================================================
    // CREATE TASK
    // ==================================================

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      project,
      assignedTo,
      priority: priority || "medium",
      dueDate: deadline,
      status: "todo",
      createdBy: req.user._id,
    });

    // ==================================================
    // UPDATE PROJECT PROGRESS
    // ==================================================

    await updateProjectProgress(project);

    // ==================================================
    // NOTIFY MEMBER
    // ==================================================

    await Notification.create({
      recipient: assignedTo,
      type: "task-assigned",
      title: "New Task Assigned",
      message: `You have been assigned a new task: ${title}`,
      relatedTask: task._id,
      relatedProject: project,
    });

    // ==================================================
    // POPULATE TASK
    // ==================================================

    const populatedTask =
      await Task.findById(task._id)
        .populate(
          "project",
          "name status progress"
        )
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        );

    res.status(201).json({
      success: true,
      message:
        "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error(
      "Create Task Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create task",
    });
  }
};

// ======================================================
// GET MANAGER TASKS
// ======================================================

const getManagerTasks = async (req, res) => {
  try {
    const {
      project,
      status,
      priority,
      search,
      assignedTo,
    } = req.query;

    const managerProjects =
      await Project.find({
        manager: req.user._id,
      }).select("_id");

    const projectIds =
      managerProjects.map(
        (project) => project._id
      );

    const filter = {
      project: {
        $in: projectIds,
      },
    };

    if (project) {
      const hasAccess = projectIds.some(
        (id) =>
          id.toString() ===
          project.toString()
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this project",
        });
      }

      filter.project = project;
    }

    if (
      status &&
      [
        "todo",
        "in-progress",
        "review",
        "completed",
      ].includes(status)
    ) {
      filter.status = status;
    }

    if (
      priority &&
      [
        "low",
        "medium",
        "high",
        "critical",
      ].includes(priority)
    ) {
      filter.priority = priority;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const tasks =
      await Task.find(filter)
        .populate(
          "project",
          "name status progress"
        )
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          dueDate: 1,
        });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get Manager Tasks Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load manager tasks",
    });
  }
};

// ======================================================
// GET MANAGER TASK BY ID
// ======================================================

const getManagerTaskById = async (
  req,
  res
) => {
  try {
    const task =
      await Task.findById(req.params.id)
        .populate(
          "project",
          "name status progress manager teamMembers"
        )
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (
      task.project.manager.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this task",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error(
      "Get Manager Task Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load task",
    });
  }
};

// ======================================================
// UPDATE TASK - MANAGER
// ======================================================

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      status,
    } = req.body;

    const task =
      await Task.findById(req.params.id)
        .populate("project");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (
      task.project.manager.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this task",
      });
    }

    const oldStatus = task.status;

    if (title !== undefined) {
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description =
        description.trim();
    }

    if (priority !== undefined) {
      if (
        ![
          "low",
          "medium",
          "high",
          "critical",
        ].includes(priority)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid task priority",
        });
      }

      task.priority = priority;
    }

    if (dueDate !== undefined) {
      const deadline =
        new Date(dueDate);

      if (
        Number.isNaN(
          deadline.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid due date",
        });
      }

      task.dueDate = deadline;
    }

    // ==================================================
    // MANAGER CAN UPDATE STATUS
    // ==================================================

    if (status !== undefined) {
      if (
        ![
          "todo",
          "in-progress",
          "review",
          "completed",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid task status",
        });
      }

      task.status = status;
    }

    // ==================================================
    // REASSIGN MEMBER
    // ==================================================

    if (assignedTo !== undefined) {
      const member =
        await User.findById(
          assignedTo
        );

      if (
        !member ||
        member.role !== "member"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid team member",
        });
      }

      if (!member.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "Team member is inactive",
        });
      }

      const isProjectMember =
        task.project.teamMembers.some(
          (memberId) =>
            memberId.toString() ===
            assignedTo.toString()
        );

      if (!isProjectMember) {
        return res.status(400).json({
          success: false,
          message:
            "Team member does not belong to this project",
        });
      }

      task.assignedTo =
        assignedTo;
    }

    await task.save();

    // ==================================================
    // UPDATE PROJECT PROGRESS
    // ==================================================

    if (oldStatus !== task.status) {
      await updateProjectProgress(
        task.project._id
      );
    }

    // ==================================================
    // NOTIFY MEMBER
    // ==================================================

    if (
      oldStatus !== task.status &&
      task.assignedTo
    ) {
      await Notification.create({
        recipient:
          task.assignedTo,
        type: "task-status",
        title:
          task.status === "completed"
            ? "Task Completed"
            : "Task Status Updated",
        message:
          `Your task "${task.title}" status has been changed to ${task.status}.`,
        relatedTask:
          task._id,
        relatedProject:
          task.project._id,
      });
    }

    const updatedTask =
      await Task.findById(
        task._id
      )
        .populate(
          "project",
          "name status progress"
        )
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        );

    res.status(200).json({
      success: true,
      message:
        "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Update Task Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update task",
    });
  }
};

// ======================================================
// DELETE TASK - MANAGER
// ======================================================

const deleteTask = async (
  req,
  res
) => {
  try {
    const task =
      await Task.findById(
        req.params.id
      ).populate("project");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (
      task.project.manager.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to delete this task",
      });
    }

    const projectId =
      task.project._id;

    await task.deleteOne();

    await updateProjectProgress(
      projectId
    );

    res.status(200).json({
      success: true,
      message:
        "Task deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Task Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete task",
    });
  }
};

// ======================================================
// MEMBER - GET ASSIGNED TASKS
// ======================================================

const getMemberTasks = async (
  req,
  res
) => {
  try {
    const {
      project,
      status,
      priority,
      search,
    } = req.query;

    const filter = {
      assignedTo: req.user._id,
    };

    if (project) {
      filter.project = project;
    }

    if (
      status &&
      [
        "todo",
        "in-progress",
        "review",
        "completed",
      ].includes(status)
    ) {
      filter.status = status;
    }

    if (
      priority &&
      [
        "low",
        "medium",
        "high",
        "critical",
      ].includes(priority)
    ) {
      filter.priority = priority;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const tasks =
      await Task.find(filter)
        .populate(
          "project",
          "name status progress"
        )
        .populate(
          "assignedTo",
          "name email role"
        )
        .sort({
          dueDate: 1,
        });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get Member Tasks Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load member tasks",
    });
  }
};

// ======================================================
// MEMBER - UPDATE TASK STATUS
// ======================================================

const updateTaskStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    // ==================================================
    // VALID STATUSES
    // ==================================================

    const allowedStatuses = [
      "todo",
      "in-progress",
      "review",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid task status",
      });
    }

    // ==================================================
    // FIND ONLY MEMBER'S OWN TASK
    // ==================================================

    const task =
      await Task.findOne({
        _id: req.params.id,
        assignedTo: req.user._id,
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found or task is not assigned to you",
      });
    }

    // ==================================================
    // COMPLETED TASK CANNOT BE CHANGED
    // ==================================================

    if (task.status === "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Completed tasks cannot be changed",
      });
    }

    const oldStatus = task.status;

    // ==================================================
    // UPDATE STATUS
    // ==================================================

    task.status = status;

    await task.save();

    // ==================================================
    // GET PROJECT
    // ==================================================

    const projectData =
      await Project.findById(
        task.project
      ).select(
        "manager name status progress"
      );

    // ==================================================
    // UPDATE PROJECT PROGRESS
    // ==================================================

    if (
      oldStatus !== "completed" &&
      status === "completed"
    ) {
      await updateProjectProgress(
        task.project
      );
    }

    // ==================================================
    // NOTIFY MANAGER
    // ==================================================

    if (
      projectData &&
      projectData.manager &&
      oldStatus !== status
    ) {
      let title =
        "Task Status Updated";

      let message =
        `Task "${task.title}" status changed from ${oldStatus} to ${status}.`;

      if (status === "review") {
        title =
          "Task Ready for Review";

        message =
          `Task "${task.title}" has been submitted for review.`;
      }

      if (status === "completed") {
        title =
          "Task Completed";

        message =
          `Task "${task.title}" has been marked as completed by the team member.`;
      }

      await Notification.create({
        recipient:
          projectData.manager,
        type: "task-status",
        title,
        message,
        relatedTask:
          task._id,
        relatedProject:
          task.project,
      });
    }

    // ==================================================
    // RETURN UPDATED TASK
    // ==================================================

    const updatedTask =
      await Task.findById(
        task._id
      )
        .populate(
          "project",
          "name status progress"
        )
        .populate(
          "assignedTo",
          "name email role"
        );

    // ==================================================
    // RESPONSE MESSAGE
    // ==================================================

    let responseMessage =
      "Task status updated successfully";

    if (status === "review") {
      responseMessage =
        "Task submitted for review";
    }

    if (status === "completed") {
      responseMessage =
        "Task marked as completed successfully";
    }

    res.status(200).json({
      success: true,
      message: responseMessage,
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Update Task Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update task status",
    });
  }
};

// ======================================================
// ADMIN - GET ALL TASKS
// ======================================================

const getAllTasks = async (
  req,
  res
) => {
  try {
    const {
      project,
      status,
      priority,
      assignedTo,
      search,
    } = req.query;

    const filter = {};

    if (project) {
      filter.project = project;
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (assignedTo) {
      filter.assignedTo =
        assignedTo;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const tasks =
      await Task.find(filter)
        .populate(
          "project",
          "name status progress"
        )
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get All Tasks Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load tasks",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createTask,

  getManagerTasks,
  getManagerTaskById,
  updateTask,
  deleteTask,

  getMemberTasks,
  updateTaskStatus,

  getAllTasks,
};