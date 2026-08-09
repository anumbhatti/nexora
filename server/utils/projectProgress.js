const Task = require("../models/Task");
const Project = require("../models/Project");

// ======================================================
// Calculate & Update Project Progress
// ======================================================

const updateProjectProgress = async (projectId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return null;
    }

    const tasks = await Task.find({
      project: projectId,
    }).select("status");

    // ==================================================
    // No Tasks
    // ==================================================

    if (tasks.length === 0) {
      project.progress = 0;

      // Empty project should not be completed
      if (project.status === "completed") {
        project.status = "planning";
      }

      await project.save();

      return {
        progress: 0,
        totalTasks: 0,
        completedTasks: 0,
      };
    }

    // ==================================================
    // Calculate Completed Tasks
    // ==================================================

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const progress = Math.round(
      (completedTasks / totalTasks) * 100
    );

    // ==================================================
    // Update Project Progress
    // ==================================================

    project.progress = progress;

    // ==================================================
    // Automatically Manage Project Status
    // ==================================================

    if (completedTasks === totalTasks) {
      // All tasks completed
      project.progress = 100;
      project.status = "completed";
    } else {
      // Tasks exist but not all are completed
      project.status = "in-progress";
    }

    await project.save();

    return {
      progress: project.progress,
      totalTasks,
      completedTasks,
    };
  } catch (error) {
    console.error(
      "Update Project Progress Error:",
      error
    );

    throw error;
  }
};

module.exports = updateProjectProgress;