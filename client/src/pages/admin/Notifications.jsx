import { useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiFilter,
  FiExternalLink,
  FiAlertCircle,
  FiClipboard,
  FiMessageCircle,
  FiFolder,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filter, setFilter] = useState("all");

  // ========================================
  // FETCH NOTIFICATIONS
  // ========================================

  const fetchNotifications = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/notifications", {
  params: {
    _t: Date.now(),
  },
});

      if (response.data.success) {
        setNotifications(
          response.data.notifications || []
        );
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error(
        "Admin Notifications Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ========================================
  // MARK SINGLE AS READ
  // ========================================

  const markAsRead = async (
    notificationId
  ) => {
    try {
      await api.patch(
        `/api/notifications/${notificationId}/read`
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  // ========================================
  // MARK ALL AS READ
  // ========================================

  const markAllAsRead = async () => {
    try {
      await api.patch(
        "/api/notifications/read-all"
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      toast.success(
        "All notifications marked as read"
      );
    } catch (error) {
      console.error(
        "Mark All Read Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to mark notifications as read"
      );
    }
  };

  // ========================================
  // NOTIFICATION CLICK
  // ========================================

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    if (notification.relatedTask) {
      navigate("/admin/tasks");
      return;
    }

    if (notification.relatedProject) {
      navigate("/admin/projects");
      return;
    }
  };

  // ========================================
  // FILTER
  // ========================================

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter(
          (notification) =>
            !notification.isRead
        )
      : notifications.filter(
          (notification) =>
            notification.type === filter
        );

  // ========================================
  // STATS
  // ========================================

  const totalNotifications =
    notifications.length;

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  const readNotifications =
    notifications.filter(
      (notification) =>
        notification.isRead
    ).length;

  // ========================================
  // TYPE ICON
  // ========================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task-assigned":
        return {
          icon: FiClipboard,
          style:
            "bg-sky-50 text-sky-500",
        };

      case "task-status":
        return {
          icon: FiCheckCircle,
          style:
            "bg-emerald-50 text-emerald-500",
        };

      case "deadline":
        return {
          icon: FiAlertCircle,
          style:
            "bg-red-50 text-red-500",
        };

      case "discussion":
        return {
          icon: FiMessageCircle,
          style:
            "bg-violet-50 text-violet-500",
        };

      case "project-update":
        return {
          icon: FiFolder,
          style:
            "bg-amber-50 text-amber-500",
        };

      default:
        return {
          icon: FiBell,
          style:
            "bg-slate-100 text-slate-500",
        };
    }
  };

  // ========================================
  // TYPE LABEL
  // ========================================

  const getNotificationType = (type) => {
    switch (type) {
      case "task-assigned":
        return "Task Assigned";

      case "task-status":
        return "Task Status";

      case "deadline":
        return "Deadline";

      case "discussion":
        return "Discussion";

      case "project-update":
        return "Project Update";

      default:
        return "Notification";
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">

          <FiRefreshCw
            size={28}
            className="mx-auto animate-spin text-sky-500"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading notifications...
          </p>

        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="space-y-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
              <FiBell size={22} />
            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-900">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Stay updated with your projects,
                tasks and team activity.
              </p>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() =>
              fetchNotifications(true)
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <FiRefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh

          </button>

          {unreadNotifications > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
            >

              <FiCheck
                size={16}
              />

              Mark all read

            </button>
          )}

        </div>

      </div>

      {/* ======================================
          STATS
      ====================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Total */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Total Notifications
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalNotifications}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
              <FiBell size={22} />
            </div>

          </div>

        </div>

        {/* Unread */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Unread
              </p>

              <p className="mt-2 text-3xl font-bold text-red-500">
                {unreadNotifications}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <FiAlertCircle size={22} />
            </div>

          </div>

        </div>

        {/* Read */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Read
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-500">
                {readNotifications}
              </p>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
              <FiCheckCircle size={22} />
            </div>

          </div>

        </div>

      </div>

      {/* ======================================
          FILTER
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div className="flex items-center gap-2">

            <FiFilter
              size={18}
              className="text-slate-500"
            />

            <h2 className="font-semibold text-slate-800">
              Filter Notifications
            </h2>

          </div>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
          >

            <option value="all">
              All Notifications
            </option>

            <option value="unread">
              Unread
            </option>

            <option value="task-assigned">
              Task Assigned
            </option>

            <option value="task-status">
              Task Status
            </option>

            <option value="deadline">
              Deadline
            </option>

            <option value="discussion">
              Discussion
            </option>

            <option value="project-update">
              Project Update
            </option>

          </select>

        </div>

      </div>

      {/* ======================================
          NOTIFICATION LIST
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">

          <h2 className="font-semibold text-slate-900">
            Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest notifications and
            updates.
          </p>

        </div>

        {filteredNotifications.length === 0 ? (
          <div className="px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">

              <FiBell size={28} />

            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No notifications found
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              There are no notifications matching
              this filter.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {filteredNotifications.map(
              (notification) => {

                const notificationIcon =
                  getNotificationIcon(
                    notification.type
                  );

                const Icon =
                  notificationIcon.icon;

                return (
                  <div
                    key={notification._id}
                    className={`group flex flex-col gap-4 px-6 py-5 transition sm:flex-row sm:items-start ${
                      !notification.isRead
                        ? "bg-sky-50/40"
                        : "bg-white"
                    } hover:bg-slate-50`}
                  >

                    {/* Icon */}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${notificationIcon.style}`}
                    >
                      <Icon size={20} />
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col justify-between gap-2 sm:flex-row">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-slate-800">
                              {notification.title ||
                                "Notification"}
                            </h3>

                            {!notification.isRead && (
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-500">
                                New
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {notification.message}
                          </p>

                        </div>

                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                          {getNotificationType(
                            notification.type
                          )}
                        </span>

                      </div>

                      {/* Meta */}

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">

                        <span className="flex items-center gap-1.5">

                          <FiClock size={12} />

                          {notification.createdAt
                            ? new Date(
                                notification.createdAt
                              ).toLocaleString()
                            : "Recently"}

                        </span>

                        {notification.relatedTask && (
                          <span className="flex items-center gap-1.5">

                            <FiClipboard
                              size={12}
                            />

                            Related Task

                          </span>
                        )}

                        {notification.relatedProject && (
                          <span className="flex items-center gap-1.5">

                            <FiFolder
                              size={12}
                            />

                            Related Project

                          </span>
                        )}

                      </div>

                    </div>

                    {/* Actions */}

                    <div className="flex shrink-0 items-center gap-2">

                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(
                              notification._id
                            )
                          }
                          title="Mark as read"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-500"
                        >

                          <FiCheck size={16} />

                        </button>
                      )}

                      {(notification.relatedTask ||
                        notification.relatedProject) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          title="Open related item"
                          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-500"
                        >

                          <FiExternalLink
                            size={16}
                          />

                        </button>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Notifications;

