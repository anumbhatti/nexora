const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

// ========================================
// Admin Dashboard
// ========================================

const getAdminDashboard = async (req, res) => {
  try {
    // ========================================
    // USER STATISTICS
    // ========================================

    const [
      totalUsers,
      activeUsers,
      totalManagers,
      totalMembers,
      totalAdmins,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        role: "manager",
      }),

      User.countDocuments({
        role: "member",
      }),

      User.countDocuments({
        role: "admin",
      }),
    ]);

    // ========================================
    // PROJECT STATISTICS
    // ========================================

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      planningProjects,
      onHoldProjects,
      cancelledProjects,
    ] = await Promise.all([
      Project.countDocuments(),

      Project.countDocuments({
        status: "in-progress",
      }),

      Project.countDocuments({
        status: "completed",
      }),

      Project.countDocuments({
        status: "planning",
      }),

      Project.countDocuments({
        status: "on-hold",
      }),

      Project.countDocuments({
        status: "cancelled",
      }),
    ]);

    // ========================================
    // TASK STATISTICS
    // ========================================

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      reviewTasks,
      completedTasks,
    ] = await Promise.all([
      Task.countDocuments(),

      Task.countDocuments({
        status: "todo",
      }),

      Task.countDocuments({
        status: "in-progress",
      }),

      Task.countDocuments({
        status: "review",
      }),

      Task.countDocuments({
        status: "completed",
      }),
    ]);

    // ========================================
    // OVERALL PROJECT PROGRESS
    // ========================================

    const progressData = await Project.aggregate([
      {
        $group: {
          _id: null,
          averageProgress: {
            $avg: "$progress",
          },
        },
      },
    ]);

    const overallProjectProgress =
      progressData.length > 0
        ? Math.round(progressData[0].averageProgress || 0)
        : 0;

    // ========================================
    // RECENT PROJECTS
    // ========================================

    const recentProjects = await Project.find()
      .populate("manager", "name email")
      .populate("createdBy", "name email")
      .select(
        "name description status priority progress startDate endDate manager createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

    // ========================================
    // UPCOMING DEADLINES
    // ========================================

    const now = new Date();

    const upcomingDeadlines = await Task.find({
      status: {
        $ne: "completed",
      },

      dueDate: {
        $gte: now,
      },
    })
      .populate("project", "name status")
      .populate("assignedTo", "name email")
      .select(
        "title priority status dueDate project assignedTo"
      )
      .sort({
        dueDate: 1,
      })
      .limit(5);

    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      success: true,

      dashboard: {
        users: {
          total: totalUsers,
          active: activeUsers,
          managers: totalManagers,
          members: totalMembers,
          admins: totalAdmins,
        },

        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          planning: planningProjects,
          onHold: onHoldProjects,
          cancelled: cancelledProjects,
          overallProgress: overallProjectProgress,
        },

        tasks: {
          total: totalTasks,
          todo: todoTasks,
          inProgress: inProgressTasks,
          review: reviewTasks,
          completed: completedTasks,
        },

        recentProjects,

        upcomingDeadlines,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Manager Dashboard
// ========================================

const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;

    // ========================================
    // MANAGER'S PROJECTS
    // ========================================

    const projects = await Project.find({
      manager: managerId,
    }).select(
      "_id name status priority progress startDate endDate manager teamMembers"
    );

    const projectIds = projects.map(
      (project) => project._id
    );

    // ========================================
    // TEAM MEMBERS
    // ========================================

    const teamMemberIds = [
      ...new Set(
        projects.flatMap((project) =>
          (project.teamMembers || []).map((member) =>
            member.toString()
          )
        )
      ),
    ];

    const totalTeamMembers = teamMemberIds.length;

    // ========================================
    // PROJECT STATISTICS
    // ========================================

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      planningProjects,
      onHoldProjects,
    ] = await Promise.all([
      Project.countDocuments({
        manager: managerId,
      }),

      Project.countDocuments({
        manager: managerId,
        status: "in-progress",
      }),

      Project.countDocuments({
        manager: managerId,
        status: "completed",
      }),

      Project.countDocuments({
        manager: managerId,
        status: "planning",
      }),

      Project.countDocuments({
        manager: managerId,
        status: "on-hold",
      }),
    ]);

    // ========================================
    // TASK STATISTICS
    // ========================================

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      reviewTasks,
      completedTasks,
    ] = await Promise.all([
      Task.countDocuments({
        project: {
          $in: projectIds,
        },
      }),

      Task.countDocuments({
        project: {
          $in: projectIds,
        },
        status: "todo",
      }),

      Task.countDocuments({
        project: {
          $in: projectIds,
        },
        status: "in-progress",
      }),

      Task.countDocuments({
        project: {
          $in: projectIds,
        },
        status: "review",
      }),

      Task.countDocuments({
        project: {
          $in: projectIds,
        },
        status: "completed",
      }),
    ]);

    // ========================================
    // OVERALL PROJECT PROGRESS
    // ========================================

    const progressData = await Project.aggregate([
      {
        $match: {
          manager: managerId,
        },
      },

      {
        $group: {
          _id: null,

          averageProgress: {
            $avg: "$progress",
          },
        },
      },
    ]);

    const overallProgress =
      progressData.length > 0
        ? Math.round(
            progressData[0].averageProgress || 0
          )
        : 0;

    // ========================================
    // UPCOMING TASK DEADLINES
    // ========================================

    const upcomingDeadlines = await Task.find({
      project: {
        $in: projectIds,
      },

      status: {
        $ne: "completed",
      },

      dueDate: {
        $gte: new Date(),
      },
    })
      .populate(
        "project",
        "name status"
      )
      .populate(
        "assignedTo",
        "name email"
      )
      .select(
        "title priority status dueDate project assignedTo"
      )
      .sort({
        dueDate: 1,
      })
      .limit(5);

    // ========================================
    // RECENT TASKS
    // ========================================

    const recentTasks = await Task.find({
      project: {
        $in: projectIds,
      },
    })
      .populate(
        "project",
        "name"
      )
      .populate(
        "assignedTo",
        "name email"
      )
      .select(
        "title status priority dueDate project assignedTo createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

    // ========================================
    // PROJECT LIST
    // ========================================

    const assignedProjects = await Project.find({
      manager: managerId,
    })
      .populate(
        "teamMembers",
        "name email"
      )
      .select(
        "name status priority progress startDate endDate teamMembers"
      )
      .sort({
        createdAt: -1,
      });

    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      success: true,

      dashboard: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          planning: planningProjects,
          onHold: onHoldProjects,
          overallProgress,
        },

        tasks: {
          total: totalTasks,
          todo: todoTasks,
          inProgress: inProgressTasks,
          review: reviewTasks,
          completed: completedTasks,
        },

        team: {
          total: totalTeamMembers,
        },

        assignedProjects,

        upcomingDeadlines,

        recentTasks,
      },
    });
  } catch (error) {
    console.error(
      "Manager dashboard error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// Member Dashboard
// ========================================

const getMemberDashboard = async (req, res) => {
  try {
    const memberId = req.user._id;

    // ========================================
    // ASSIGNED PROJECTS
    // ========================================

    const assignedProjects = await Project.find({
      teamMembers: memberId,
    })
      .populate(
        "manager",
        "name email"
      )
      .select(
        "name description status priority progress startDate endDate manager"
      )
      .sort({
        createdAt: -1,
      });

    const projectIds = assignedProjects.map(
      (project) => project._id
    );

    // ========================================
    // TASK STATISTICS
    // ========================================

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      reviewTasks,
      completedTasks,
    ] = await Promise.all([
      Task.countDocuments({
        assignedTo: memberId,
      }),

      Task.countDocuments({
        assignedTo: memberId,
        status: "todo",
      }),

      Task.countDocuments({
        assignedTo: memberId,
        status: "in-progress",
      }),

      Task.countDocuments({
        assignedTo: memberId,
        status: "review",
      }),

      Task.countDocuments({
        assignedTo: memberId,
        status: "completed",
      }),
    ]);

    // ========================================
    // OVERALL TASK PROGRESS
    // ========================================

    const progressData = await Task.aggregate([
      {
        $match: {
          assignedTo: memberId,
        },
      },

      {
        $group: {
          _id: null,

          averageProgress: {
            $avg: "$progress",
          },
        },
      },
    ]);

    const overallTaskProgress =
      progressData.length > 0
        ? Math.round(
            progressData[0].averageProgress || 0
          )
        : 0;

    // ========================================
    // UPCOMING DEADLINES
    // ========================================

    const upcomingDeadlines = await Task.find({
      assignedTo: memberId,

      status: {
        $ne: "completed",
      },

      dueDate: {
        $gte: new Date(),
      },
    })
      .populate(
        "project",
        "name status"
      )
      .select(
        "title description priority status dueDate project progress"
      )
      .sort({
        dueDate: 1,
      })
      .limit(5);

    // ========================================
    // RECENT TASKS
    // ========================================

    const recentTasks = await Task.find({
      assignedTo: memberId,
    })
      .populate(
        "project",
        "name status"
      )
      .select(
        "title priority status dueDate progress project createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5);

    // ========================================
    // UNREAD NOTIFICATIONS
    // ========================================

    const unreadNotifications =
      await Notification.find({
        recipient: memberId,
        isRead: false,
      })
        .populate(
          "relatedTask",
          "title status"
        )
        .populate(
          "relatedProject",
          "name status"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5);

    const unreadNotificationCount =
      await Notification.countDocuments({
        recipient: memberId,
        isRead: false,
      });

    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      success: true,

      dashboard: {
        projects: {
          total: assignedProjects.length,
        },

        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          review: reviewTasks,
          completed: completedTasks,
          overallProgress: overallTaskProgress,
        },

        assignedProjects,

        upcomingDeadlines,

        recentTasks,

        notifications: {
          unreadCount: unreadNotificationCount,
          recent: unreadNotifications,
        },
      },
    });
  } catch (error) {
    console.error(
      "Member dashboard error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  getAdminDashboard,
  getManagerDashboard,
  getMemberDashboard,
};