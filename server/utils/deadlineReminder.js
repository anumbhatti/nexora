const Task = require("../models/Task");
const Project = require("../models/Project");
const Notification = require("../models/Notification");

const checkUpcomingDeadlines = async () => {
  try {
    const now = new Date();

    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const tasks = await Task.find({
      status: { $ne: "completed" },
      dueDate: {
        $gte: now,
        $lte: twoDaysFromNow,
      },
    }).populate("project", "name manager");

    for (const task of tasks) {
      if (!task.project) continue;

      const daysRemaining = Math.ceil(
        (new Date(task.dueDate) - now) /
          (1000 * 60 * 60 * 24)
      );

      const message =
        daysRemaining <= 1
          ? `Task "${task.title}" is due tomorrow.`
          : `Task "${task.title}" is due in ${daysRemaining} days.`;

      // ========================================
      // Notify Assigned Member
      // ========================================

      const memberNotificationExists =
        await Notification.findOne({
          recipient: task.assignedTo,
          type: "deadline",
          relatedTask: task._id,
        });

      if (!memberNotificationExists) {
        await Notification.create({
          recipient: task.assignedTo,
          type: "deadline",
          title: "Upcoming Task Deadline",
          message,
          relatedTask: task._id,
          relatedProject: task.project._id,
        });
      }

      // ========================================
      // Notify Project Manager
      // ========================================

      if (task.project.manager) {
        const managerNotificationExists =
          await Notification.findOne({
            recipient: task.project.manager,
            type: "deadline",
            relatedTask: task._id,
          });

        if (!managerNotificationExists) {
          await Notification.create({
            recipient: task.project.manager,
            type: "deadline",
            title: "Upcoming Task Deadline",
            message,
            relatedTask: task._id,
            relatedProject: task.project._id,
          });
        }
      }
    }

    console.log(
      `Deadline check completed. ${tasks.length} upcoming task(s) found.`
    );
  } catch (error) {
    console.error(
      "Deadline reminder error:",
      error.message
    );
  }
};

module.exports = checkUpcomingDeadlines;