import { useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiClock,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../../api/axios";

function ManagerNotifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [unreadCount, setUnreadCount] =
    useState(0);

  // ==================================================
  // FETCH NOTIFICATIONS
  // ==================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/notifications",
        {
          params: {
            _t: Date.now(),
          },
        }
      );

      console.log(
        "MANAGER NOTIFICATIONS:",
        response.data
      );

      if (response.data?.success) {
        setNotifications(
          Array.isArray(
            response.data.notifications
          )
            ? response.data.notifications
            : []
        );

        setUnreadCount(
          response.data.unreadCount || 0
        );
      }
    } catch (error) {
      console.error(
        "Manager Notifications Error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ==================================================
  // MARK ONE AS READ
  // ==================================================

  const markAsRead = async (
    notificationId
  ) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
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

      setUnreadCount((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  // ==================================================
  // MARK ALL AS READ
  // ==================================================

  const markAllAsRead = async () => {
    try {
      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);

      toast.success(
        "All notifications marked as read"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update notifications"
      );
    }
  };

  // ==================================================
  // DELETE NOTIFICATION
  // ==================================================

  const deleteNotification = async (
    notificationId
  ) => {
    try {
      await api.delete(
        `/notifications/${notificationId}`
      );

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !==
            notificationId
        )
      );

      const deletedNotification =
        notifications.find(
          (notification) =>
            notification._id ===
            notificationId
        );

      if (
        deletedNotification &&
        !deletedNotification.isRead
      ) {
        setUnreadCount((prev) =>
          prev > 0 ? prev - 1 : 0
        );
      }

      toast.success(
        "Notification deleted"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete notification"
      );
    }
  };

  // ==================================================
  // TIME FORMAT
  // ==================================================

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(
      date
    ).toLocaleString();
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-500">
              <FiBell size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Stay updated with your projects and team.
              </p>
            </div>

          </div>
        </div>

        <div className="flex gap-3">

          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <FiRefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
            >
              <FiCheck size={17} />

              Mark all read
            </button>
          )}

        </div>

      </div>

      {/* ==================================================
          STATS
      ================================================== */}

      <div className="mb-8 grid gap-5 sm:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Total Notifications
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {notifications.length}
          </p>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Unread Notifications
          </p>

          <p className="mt-2 text-3xl font-bold text-red-500">
            {unreadCount}
          </p>

        </div>

      </div>

      {/* ==================================================
          NOTIFICATIONS
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {loading ? (
          <div className="px-6 py-16 text-center">

            <FiRefreshCw
              size={28}
              className="mx-auto animate-spin text-sky-500"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading notifications...
            </p>

          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

              <FiBell
                size={28}
                className="text-slate-400"
              />

            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-800">
              No notifications
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              You're all caught up.
            </p>

          </div>
        ) : (
          <div>

            {notifications.map(
              (notification) => (
                <div
                  key={notification._id}
                  className={`flex gap-4 border-b border-slate-100 p-5 transition last:border-b-0 hover:bg-slate-50 ${
                    !notification.isRead
                      ? "bg-sky-50/40"
                      : "bg-white"
                  }`}
                >

                  {/* Dot */}

                  <div className="pt-2">

                    <span
                      className={`block h-3 w-3 rounded-full ${
                        notification.isRead
                          ? "bg-slate-200"
                          : "bg-red-500"
                      }`}
                    />

                  </div>

                  {/* Content */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <h3 className="font-semibold text-slate-900">
                          {notification.title ||
                            "Notification"}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {notification.message}
                        </p>

                      </div>

                      <div className="flex items-center gap-1 whitespace-nowrap text-xs text-slate-400">

                        <FiClock size={13} />

                        {formatDate(
                          notification.createdAt
                        )}

                      </div>

                    </div>

                    {/* Related information */}

                    {(notification.relatedTask ||
                      notification.relatedProject) && (
                      <div className="mt-3 flex flex-wrap gap-2">

                        {notification.relatedTask && (
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            Task:{" "}
                            {
                              notification
                                .relatedTask
                                .title
                            }
                          </span>
                        )}

                        {notification.relatedProject && (
                          <span className="rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                            Project:{" "}
                            {
                              notification
                                .relatedProject
                                .name
                            }
                          </span>
                        )}

                      </div>
                    )}

                    {/* Actions */}

                    <div className="mt-4 flex items-center gap-3">

                      {!notification.isRead && (
                        <button
                          onClick={() =>
                            markAsRead(
                              notification._id
                            )
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold text-sky-500 hover:text-sky-600"
                        >
                          <FiCheck size={14} />

                          Mark as read
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotification(
                            notification._id
                          )
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
                      >
                        <FiTrash2 size={14} />

                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default ManagerNotifications;