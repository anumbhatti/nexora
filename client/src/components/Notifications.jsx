import { useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiClock,
  FiAlertCircle,
  FiMessageSquare,
  FiClipboard,
  FiFolder,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // ======================================================
  // FETCH NOTIFICATIONS
  // ======================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications", {
        params: {
          _t: Date.now(),
        },
      });

      if (response.data?.success) {
        setNotifications(
          Array.isArray(response.data.notifications)
            ? response.data.notifications
            : []
        );
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Fetch Notifications Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load notifications"
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ======================================================
  // MARK ONE AS READ
  // ======================================================

  const handleMarkAsRead = async (id) => {
    try {
      setProcessingId(id);

      const response = await api.patch(
        `/api/notifications/${id}/read`
      );

      if (response.data?.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === id
              ? {
                  ...notification,
                  isRead: true,
                }
              : notification
          )
        );
      }
    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to mark notification as read"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ======================================================
  // MARK ALL AS READ
  // ======================================================

  const handleMarkAllAsRead = async () => {
    const unreadExists = notifications.some(
      (notification) => !notification.isRead
    );

    if (!unreadExists) {
      toast("All notifications are already read");
      return;
    }

    try {
      const response = await api.patch(
        "/notifications/read-all"
      );

      if (response.data?.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );

        toast.success(
          "All notifications marked as read"
        );
      }
    } catch (error) {
      console.error(
        "Mark All Read Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to mark all notifications"
      );
    }
  };

  // ======================================================
  // DELETE NOTIFICATION
  // ======================================================

  const handleDelete = async (id) => {
    try {
      setProcessingId(id);

      const response = await api.delete(
        `/api/notifications/${id}`
      );

      if (response.data?.success) {
        setNotifications((prev) =>
          prev.filter(
            (notification) =>
              notification._id !== id
          )
        );

        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to delete notification"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ======================================================
  // NOTIFICATION ICON
  // ======================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task-assigned":
        return {
          icon: FiClipboard,
          style: "bg-sky-50 text-sky-500",
        };

      case "task-status":
        return {
          icon: FiCheckCircle,
          style: "bg-emerald-50 text-emerald-500",
        };

      case "discussion":
        return {
          icon: FiMessageSquare,
          style: "bg-violet-50 text-violet-500",
        };

      case "deadline":
        return {
          icon: FiClock,
          style: "bg-orange-50 text-orange-500",
        };

      case "project-update":
        return {
          icon: FiFolder,
          style: "bg-indigo-50 text-indigo-500",
        };

      default:
        return {
          icon: FiBell,
          style: "bg-slate-100 text-slate-500",
        };
    }
  };

  // ======================================================
  // TIME FORMAT
  // ======================================================

  const formatTime = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } ago`;
    }

    if (hours < 24) {
      return `${hours} ${
        hours === 1 ? "hour" : "hours"
      } ago`;
    }

    if (days < 7) {
      return `${days} ${
        days === 1 ? "day" : "days"
      } ago`;
    }

    return notificationDate.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ======================================================
  // STATS
  // ======================================================

  const totalNotifications = notifications.length;

  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const readNotifications = notifications.filter(
    (notification) => notification.isRead
  ).length;

  // ======================================================
  // LOADING
  // ======================================================

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

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
            <FiBell size={21} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with your latest activities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={fetchNotifications}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadNotifications === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <FiCheckCircle size={16} />
            Mark All Read
          </button>

        </div>
      </div>

      {/* STATS */}

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

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
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

              <p className="mt-2 text-3xl font-bold text-sky-500">
                {unreadNotifications}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
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
              <FiCheck size={22} />
            </div>

          </div>
        </div>

      </div>

      {/* NOTIFICATION LIST */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Recent Notifications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest updates and activities.
          </p>
        </div>

        {notifications.length === 0 ? (
          <div className="px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiBell size={28} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-800">
              No notifications
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              You're all caught up. New notifications
              will appear here.
            </p>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {notifications.map((notification) => {
              const notificationIcon =
                getNotificationIcon(
                  notification.type
                );

              const Icon = notificationIcon.icon;

              return (
                <div
                  key={notification._id}
                  className={`group flex flex-col gap-4 px-6 py-5 transition sm:flex-row sm:items-start sm:justify-between ${
                    notification.isRead
                      ? "bg-white hover:bg-slate-50"
                      : "bg-sky-50/40 hover:bg-sky-50/70"
                  }`}
                >

                  {/* Left */}

                  <div className="flex min-w-0 gap-4">

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${notificationIcon.style}`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3
                          className={`text-sm font-semibold ${
                            notification.isRead
                              ? "text-slate-800"
                              : "text-slate-900"
                          }`}
                        >
                          {notification.title ||
                            "Notification"}
                        </h3>

                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                        )}

                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">

                        <span>
                          {formatTime(
                            notification.createdAt
                          )}
                        </span>

                        {notification.relatedProject?.name && (
                          <>
                            <span>•</span>

                            <span>
                              {
                                notification.relatedProject.name
                              }
                            </span>
                          </>
                        )}

                      </div>

                    </div>
                  </div>

                  {/* Actions */}

                  <div className="flex shrink-0 items-center gap-2 sm:pt-1">

                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsRead(
                            notification._id
                          )
                        }
                        disabled={
                          processingId ===
                          notification._id
                        }
                        title="Mark as read"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiCheck size={14} />
                        Read
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          notification._id
                        )
                      }
                      disabled={
                        processingId ===
                        notification._id
                      }
                      title="Delete notification"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiTrash2 size={15} />
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}

export default Notifications;