const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

const updateProjectProgress = require("../utils/projectProgress");

// ======================================================
// CREATE PROJECT - ADMIN
// ======================================================

const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      priority,
      manager,
      teamMembers,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !startDate ||
      !endDate ||
      !manager
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, start date, end date and manager are required",
      });
    }

    // Check manager
    const managerUser = await User.findById(manager);

    if (!managerUser) {
      return res.status(404).json({
        success: false,
        message: "Project manager not found",
      });
    }

    if (managerUser.role !== "manager") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a project manager",
      });
    }

    if (!managerUser.isActive) {
      return res.status(400).json({
        success: false,
        message: "Selected project manager is inactive",
      });
    }

    // Validate team members
    let validTeamMembers = [];

    if (
      Array.isArray(teamMembers) &&
      teamMembers.length > 0
    ) {
      const users = await User.find({
        _id: { $in: teamMembers },
        role: "member",
        isActive: true,
      });

      validTeamMembers = users.map(
        (user) => user._id
      );
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      priority: priority || "medium",
      manager,
      teamMembers: validTeamMembers,
      progress: 0,
      status: "planning",
      createdBy: req.user._id,
    });

    // Notification - Manager
    await Notification.create({
      recipient: managerUser._id,
      type: "project-update",
      title: "New Project Assigned",
      message: `You have been assigned as manager of the project "${name}".`,
      relatedProject: project._id,
    });

    // Notification - Team Members
    if (validTeamMembers.length > 0) {
      const teamNotifications =
        validTeamMembers.map((memberId) => ({
          recipient: memberId,
          type: "project-update",
          title: "Added to New Project",
          message: `You have been added to the project "${name}".`,
          relatedProject: project._id,
        }));

      await Notification.insertMany(
        teamNotifications
      );
    }

    const populatedProject =
      await Project.findById(project._id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error(
      "Create Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL PROJECTS - ADMIN
// ======================================================

const getAllProjects = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      manager,
    } = req.query;

    const filter = {};

    // Search
    if (search) {
      filter.$or = [
        {
          name: {
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

    // Status
    if (
      status &&
      [
        "planning",
        "in-progress",
        "on-hold",
        "completed",
        "cancelled",
      ].includes(status)
    ) {
      filter.status = status;
    }

    // Priority
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

    // Manager
    if (manager) {
      filter.manager = manager;
    }

    const projects = await Project.find(filter)
      .populate(
        "manager",
        "name email role"
      )
      .populate(
        "teamMembers",
        "name email role"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .sort({
        createdAt: -1,
      });

    // Sync progress for all projects
    for (const project of projects) {
      await updateProjectProgress(project._id);
    }

    // Get fresh project data
    const updatedProjects =
      await Project.find(filter)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
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
      count: updatedProjects.length,
      projects: updatedProjects,
    });
  } catch (error) {
    console.error(
      "Get Projects Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET SINGLE PROJECT - ADMIN
// ======================================================

const getProjectById = async (req, res) => {
  try {
    const project =
      await Project.findById(req.params.id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Sync latest progress
    await updateProjectProgress(project._id);

    // Get fresh project
    const updatedProject =
      await Project.findById(project._id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        );

    // Get project tasks
    const tasks = await Task.find({
      project: project._id,
    })
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
      project: updatedProject,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE PROJECT - ADMIN
// ======================================================

const updateProject = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      priority,
      status,
      manager,
      teamMembers,
    } = req.body;

    const project =
      await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const oldManager = project.manager
      ? project.manager.toString()
      : null;

    // Name
    if (name !== undefined) {
      project.name = name;
    }

    // Description
    if (description !== undefined) {
      project.description = description;
    }

    // Start Date
    if (startDate !== undefined) {
      project.startDate = startDate;
    }

    // End Date
    if (endDate !== undefined) {
      project.endDate = endDate;
    }

    // Priority
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
          message: "Invalid project priority",
        });
      }

      project.priority = priority;
    }

    // Status
    if (status !== undefined) {
      if (
        ![
          "planning",
          "in-progress",
          "on-hold",
          "completed",
          "cancelled",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid project status",
        });
      }

      project.status = status;
    }

    // Manager
    if (manager !== undefined) {
      const managerUser =
        await User.findById(manager);

      if (
        !managerUser ||
        managerUser.role !== "manager"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid project manager",
        });
      }

      if (!managerUser.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "Selected project manager is inactive",
        });
      }

      project.manager = managerUser._id;
    }

    // Team Members
    if (teamMembers !== undefined) {
      if (!Array.isArray(teamMembers)) {
        return res.status(400).json({
          success: false,
          message:
            "Team members must be an array",
        });
      }

      const users = await User.find({
        _id: { $in: teamMembers },
        role: "member",
        isActive: true,
      });

      project.teamMembers = users.map(
        (user) => user._id
      );
    }

    await project.save();

    // Sync progress after update
    await updateProjectProgress(project._id);

    // Notify new manager
    if (
      project.manager &&
      oldManager !==
        project.manager.toString()
    ) {
      await Notification.create({
        recipient: project.manager,
        type: "project-update",
        title: "Project Updated",
        message: `You have been assigned to manage the project "${project.name}".`,
        relatedProject: project._id,
      });
    }

    const updatedProject =
      await Project.findById(project._id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        );

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(
      "Update Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE PROJECT - ADMIN
// ======================================================

const deleteProject = async (req, res) => {
  try {
    const project =
      await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Delete project tasks
    await Task.deleteMany({
      project: project._id,
    });

    // Delete project notifications
    await Notification.deleteMany({
      relatedProject: project._id,
    });

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET MANAGER PROJECTS
// ======================================================

const getManagerProjects = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
    } = req.query;

    const filter = {
      manager: req.user._id,
    };

    // Search
    if (search) {
      filter.$or = [
        {
          name: {
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

    // Status
    if (
      status &&
      [
        "planning",
        "in-progress",
        "on-hold",
        "completed",
        "cancelled",
      ].includes(status)
    ) {
      filter.status = status;
    }

    // Priority
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

    let projects =
      await Project.find(filter)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    // Sync progress
    for (const project of projects) {
      await updateProjectProgress(project._id);
    }

    // Get fresh projects
    projects =
      await Project.find(filter)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(
      "Get Manager Projects Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET MANAGER PROJECT BY ID
// ======================================================

const getManagerProjectById = async (
  req,
  res
) => {
  try {
    const project =
      await Project.findOne({
        _id: req.params.id,
        manager: req.user._id,
      })
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you are not assigned to this project",
      });
    }

    // Sync progress
    await updateProjectProgress(project._id);

    const updatedProject =
      await Project.findById(project._id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        );

    // Get project tasks
    const tasks = await Task.find({
      project: project._id,
    })
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
      project: updatedProject,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get Manager Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE PROJECT - MANAGER
// ======================================================

const updateManagerProject = async (
  req,
  res
) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      priority,
      status,
    } = req.body;

    const project =
      await Project.findOne({
        _id: req.params.id,
        manager: req.user._id,
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you are not assigned to this project",
      });
    }

    if (name !== undefined) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (startDate !== undefined) {
      project.startDate = startDate;
    }

    if (endDate !== undefined) {
      project.endDate = endDate;
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
            "Invalid project priority",
        });
      }

      project.priority = priority;
    }

    // Manager can change project status,
    // but cannot manually mark it completed.
    if (status !== undefined) {
      if (
        ![
          "planning",
          "in-progress",
          "on-hold",
          "cancelled",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Project can only be marked completed when all tasks are completed",
        });
      }

      project.status = status;
    }

    await project.save();

    // Automatically calculate progress/status
    await updateProjectProgress(project._id);

    // Notify team members
    if (
      project.teamMembers &&
      project.teamMembers.length > 0
    ) {
      const notifications =
        project.teamMembers.map(
          (memberId) => ({
            recipient: memberId,
            type: "project-update",
            title: "Project Updated",
            message: `The project "${project.name}" has been updated by the project manager.`,
            relatedProject: project._id,
          })
        );

      await Notification.insertMany(
        notifications
      );
    }

    const updatedProject =
      await Project.findById(project._id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        );

    res.status(200).json({
      success: true,
      message:
        "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(
      "Update Manager Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// ADD TEAM MEMBER - MANAGER
// ======================================================

const addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      manager: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you are not assigned to this project",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    if (user.role !== "member") {
      return res.status(400).json({
        success: false,
        message: "Only members can be added to a project",
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "This team member is inactive",
      });
    }

    const alreadyMember = project.teamMembers?.some(
      (memberId) =>
        memberId.toString() === userId.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    // Add member
    project.teamMembers.push(userId);

    await project.save();

    // Notification
    await Notification.create({
      recipient: userId,
      type: "project-update",
      title: "Added to Project",
      message: `You have been added to the project "${project.name}".`,
      relatedProject: project._id,
    });

    const updatedProject = await Project.findById(
      project._id
    )
      .populate("manager", "name email role")
      .populate("teamMembers", "name email role");

    res.status(200).json({
      success: true,
      message: "Team member added successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(
      "Add Team Member Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// REMOVE TEAM MEMBER - MANAGER
// ======================================================

const removeTeamMember = async (
  req,
  res
) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const project =
      await Project.findOne({
        _id: req.params.id,
        manager: req.user._id,
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you are not assigned to this project",
      });
    }

    const memberExists =
      project.teamMembers.some(
        (memberId) =>
          memberId.toString() ===
          userId.toString()
      );

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message:
          "This user is not a member of this project",
      });
    }

    // Remove member
    project.teamMembers =
      project.teamMembers.filter(
        (memberId) =>
          memberId.toString() !==
          userId.toString()
      );

    await project.save();

    // Optional: unassign this member's tasks
    await Task.updateMany(
      {
        project: project._id,
        assignedTo: userId,
      },
      {
        $unset: {
          assignedTo: "",
        },
      }
    );

    // Recalculate progress
    await updateProjectProgress(project._id);

    const updatedProject =
      await Project.findById(
        project._id
      )
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        );

    res.status(200).json({
      success: true,
      message:
        "Team member removed successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(
      "Remove Team Member Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET AVAILABLE TEAM MEMBERS - MANAGER
// ======================================================

const getAvailableTeamMembers = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      manager: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you are not assigned to this project",
      });
    }

    // Make sure teamMembers is always an array
    const assignedMemberIds = project.teamMembers || [];

    const users = await User.find({
      role: "member",
      isActive: true,
      _id: {
        $nin: assignedMemberIds,
      },
    })
      .select("name email role isActive")
      .sort({ name: 1 });

    console.log("Project:", project.name);
    console.log("Assigned Members:", assignedMemberIds);
    console.log("Available Members:", users);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get Available Members Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET MEMBER PROJECTS
// ======================================================

const getMemberProjects = async (
  req,
  res
) => {
  try {
    const {
      search,
      status,
      priority,
    } = req.query;

    const filter = {
      teamMembers: req.user._id,
    };

    // Search
    if (search) {
      filter.$or = [
        {
          name: {
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

    // Status
    if (
      status &&
      [
        "planning",
        "in-progress",
        "on-hold",
        "completed",
        "cancelled",
      ].includes(status)
    ) {
      filter.status = status;
    }

    // Priority
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

    let projects =
      await Project.find(filter)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .sort({
          createdAt: -1,
        });

    // Sync progress
    for (const project of projects) {
      await updateProjectProgress(project._id);
    }

    // Fresh projects
    projects =
      await Project.find(filter)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
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
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(
      "Get Member Projects Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET MEMBER PROJECT BY ID
// ======================================================

const getMemberProjectById = async (
  req,
  res
) => {
  try {
    const project =
      await Project.findOne({
        _id: req.params.id,
        teamMembers: req.user._id,
      })
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        );

    if (!project) {
      return res.status(404).json({
        success: false,
        message:
          "Project not found or you are not assigned to this project",
      });
    }

    // Sync progress
    await updateProjectProgress(project._id);

    const updatedProject =
      await Project.findById(project._id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "teamMembers",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        );

    // Get member's tasks for this project
    const tasks = await Task.find({
      project: project._id,
      assignedTo: req.user._id,
    })
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
      project: updatedProject,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get Member Project Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
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
};