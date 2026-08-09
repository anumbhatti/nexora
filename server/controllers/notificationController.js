const Notification = require("../models/Notification");

// ======================================================
// GET NOTIFICATIONS
// ADMIN = ALL NOTIFICATIONS
// MANAGER/MEMBER = OWN NOTIFICATIONS
// ======================================================

const getMyNotifications = async (req, res) => {
  try {
    // Disable cache
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    // ==================================================
    // Build Filter
    // ==================================================

    let filter = {};

    // Admin can see ALL notifications
    if (req.user.role !== "admin") {
      filter.recipient = req.user._id;
    }

    // ==================================================
    // Fetch Notifications
    // ==================================================

    const notifications = await Notification.find(filter)
      .populate(
        "recipient",
        "name email role"
      )
      .populate(
        "relatedTask",
        "title status"
      )
      .populate(
        "relatedProject",
        "name status progress"
      )
      .sort({
        createdAt: -1,
      });

    // ==================================================
    // Unread Count
    // ==================================================

    const unreadCount =
      notifications.filter(
        (notification) =>
          notification.isRead === false
      ).length;

    console.log(
      "======================================"
    );

    console.log(
      "Notification User:",
      req.user.name
    );

    console.log(
      "Notification Role:",
      req.user.role
    );

    console.log(
      "Notifications Found:",
      notifications.length
    );

    console.log(
      "Unread Notifications:",
      unreadCount
    );

    console.log(
      "======================================"
    );

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get Notifications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load notifications",
      error: error.message,
    });
  }
};

// ======================================================
// MARK ONE NOTIFICATION AS READ
// ======================================================

const markAsRead = async (req, res) => {
  try {
    let filter = {
      _id: req.params.id,
    };

    // Non-admin can only mark own notification
    if (req.user.role !== "admin") {
      filter.recipient = req.user._id;
    }

    const notification =
      await Notification.findOne(filter);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark Notification Read Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark notification as read",
    });
  }
};

// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================================

const markAllAsRead = async (req, res) => {
  try {
    let filter = {
      isRead: false,
    };

    // Non-admin only own notifications
    if (req.user.role !== "admin") {
      filter.recipient = req.user._id;
    }

    await Notification.updateMany(
      filter,
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark All Notifications Read Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to mark all notifications as read",
    });
  }
};

// ======================================================
// DELETE NOTIFICATION
// ======================================================

const deleteNotification = async (
  req,
  res
) => {
  try {
    let filter = {
      _id: req.params.id,
    };

    // Non-admin can only delete own
    // Admin can delete any
    if (req.user.role !== "admin") {
      filter.recipient = req.user._id;
    }

    const notification =
      await Notification.findOneAndDelete(
        filter
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Notification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete notification",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};