import { useEffect, useRef, useState } from "react";
import {
  FiMenu,
  FiBell,
  FiChevronDown,
  FiCheck,
  FiClock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";

function ManagerTopbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] =
    useState(false);

  const notificationRef = useRef(null);

  // ========================================
  // Fetch Notifications
  // ========================================

  const fetchNotifications = async () => {
    try {
      const response = await api.get(
        `/notifications?_t=${Date.now()}`
      );

      if (response.data.success) {
        setNotifications(
          response.data.notifications || []
        );
      }
    } catch (error) {
      console.error(
        "Manager Notifications Error:",
        error
      );
    }
  };

  // ========================================
  // Initial Fetch
  // ========================================

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // ========================================
  // Close Dropdown
  // ========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ========================================
  // Mark Notification Read
  // ========================================

  const markAsRead = async (notificationId) => {
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
    } catch (error) {
      console.error(
        "Mark Notification Error:",
        error
      );
    }
  };

  // ========================================
  // Notification Click
  // ========================================

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setShowNotifications(false);

    if (notification.relatedTask) {
      navigate("/manager/tasks");
      return;
    }

    if (notification.relatedProject) {
      navigate("/manager/projects");
      return;
    }
  };

  // ========================================
  // Unread Count
  // ========================================

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <>
      {/* Left */}

      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <FiMenu size={21} />
        </button>

        <div className="min-w-0">

          <h2 className="truncate text-lg font-semibold text-slate-800">
            Welcome back, {user?.name || "Manager"}
          </h2>

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-3 sm:gap-5">

        {/* Notifications */}

        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setShowNotifications(
                (previous) => !previous
              )
            }
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <FiBell size={20} />

            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9
                ? "9+"
                : unreadCount}
            </span>
          </button>

          {/* Notification Dropdown */}

          {showNotifications && (
            <div className="absolute right-0 top-14 z-50 w-[350px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {unreadCount} unread
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await api.patch(
                          "/api/notifications/read-all"
                        );

                        setNotifications((prev) =>
                          prev.map(
                            (notification) => ({
                              ...notification,
                              isRead: true,
                            })
                          )
                        );
                      } catch (error) {
                        console.error(
                          "Mark All Read Error:",
                          error
                        );
                      }
                    }}
                    className="text-xs font-semibold text-sky-500 hover:text-sky-600"
                  >
                    Mark all read
                  </button>
                )}

              </div>

              {/* Notifications List */}

              <div className="max-h-[380px] overflow-y-auto">

                {notifications.length === 0 ? (
                  <div className="px-5 py-10 text-center">

                    <FiBell
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-500">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      You're all caught up.
                    </p>

                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <button
                        type="button"
                        key={notification._id}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className={`flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                          !notification.isRead
                            ? "bg-sky-50/50"
                            : "bg-white"
                        }`}
                      >

                        {/* Status Dot */}

                        <div className="pt-1.5">
                          <span
                            className={`block h-2.5 w-2.5 rounded-full ${
                              notification.isRead
                                ? "bg-slate-200"
                                : "bg-sky-500"
                            }`}
                          />
                        </div>

                        {/* Content */}

                        <div className="min-w-0 flex-1">

                          <p className="text-sm font-semibold text-slate-800">
                            {notification.title ||
                              "Notification"}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {notification.message}
                          </p>

                          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">

                            <FiClock size={11} />

                            {notification.createdAt
                              ? new Date(
                                  notification.createdAt
                                ).toLocaleString()
                              : "Recently"}

                          </div>

                        </div>

                        {!notification.isRead && (
                          <FiCheck
                            size={16}
                            className="mt-1 text-sky-500"
                          />
                        )}

                      </button>
                    )
                  )
                )}

              </div>

              {/* Footer */}

              {notifications.length > 0 && (
                <div className="border-t border-slate-100 px-5 py-3 text-center">

                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(
                        "/manager/notifications"
                      );
                    }}
                    className="text-sm font-semibold text-sky-500 hover:text-sky-600"
                  >
                    View all notifications
                  </button>

                </div>
              )}

            </div>
          )}
        </div>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Profile */}

        <button
          type="button"
          onClick={() =>
            navigate("/manager/profile")
          }
          className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50"
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-600">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "M"}
          </div>

          <div className="hidden text-left sm:block">

            <p className="text-sm font-semibold text-slate-800">
              {user?.name || "Project Manager"}
            </p>

            <p className="text-xs capitalize text-slate-400">
              {user?.role || "manager"}
            </p>

          </div>

          <FiChevronDown
            size={16}
            className="hidden text-slate-400 sm:block"
          />

        </button>

      </div>
    </>
  );
}

export default ManagerTopbar;