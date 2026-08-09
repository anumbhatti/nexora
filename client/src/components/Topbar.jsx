import { useEffect, useRef, useState } from "react";
import {
  FiMenu,
  FiBell,
  FiCheck,
  FiClock,
  FiChevronDown,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";


function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const notificationRef = useRef(null);

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {
  try {
    setLoadingNotifications(true);

    const response = await api.get("/api/notifications", {
  params: {
    _t: Date.now(),
  },
});

    console.log(
      "ADMIN NOTIFICATIONS RESPONSE:",
      response.data
    );

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
    console.error(
      "Fetch Admin Notifications Error:",
      error
    );

    toast.error(
      error?.response?.data?.message ||
        "Failed to load notifications"
    );

    setNotifications([]);
  } finally {
    setLoadingNotifications(false);
  }
};

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // =====================================================
  // CLOSE DROPDOWN
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
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

  // =====================================================
  // MARK SINGLE NOTIFICATION AS READ
  // =====================================================

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
      toast.error(
        error?.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

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

  // =====================================================
  // NOTIFICATION CLICK
  // =====================================================

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    setShowNotifications(false);

    if (notification.relatedTask) {
      navigate("/admin/tasks");
      return;
    }

    if (notification.relatedProject) {
      navigate("/admin/projects");
      return;
    }

    navigate("/admin/notifications");
  };

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // =====================================================
  // PROFILE CLICK
  // =====================================================

  const handleProfileClick = () => {
    navigate("/admin/profile");
  };

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="flex items-center gap-4">

        {/* Mobile Menu */}

        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <FiMenu size={21} />
        </button>

        <div>
          <p className="text-sm text-slate-400">
            Welcome back
          </p>

          <h2 className="text-lg font-semibold text-slate-800">
            {user?.name || "Administrator"}
          </h2>
        </div>

      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="flex items-center gap-3 sm:gap-5">

       

        {/* =================================================
            NOTIFICATION BELL
        ================================================= */}

        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            onClick={() =>
              setShowNotifications(
                (previous) => !previous
              )
            }
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <FiBell size={21} />

            {/* RED COUNT - ALWAYS VISIBLE */}

            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9
                ? "9+"
                : unreadCount}
            </span>
          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================= */}

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
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-sky-500 hover:text-sky-600"
                  >
                    Mark all read
                  </button>
                )}

              </div>

              {/* Notification List */}

              <div className="max-h-[380px] overflow-y-auto">

                {loadingNotifications ? (
                  <div className="px-5 py-10 text-center text-sm text-slate-400">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
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

                        {/* Dot */}

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
                    onClick={() => {
                      setShowNotifications(false);

                      navigate(
                        "/admin/notifications"
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

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* =================================================
            ADMIN PROFILE
        ================================================= */}

        <button
          onClick={handleProfileClick}
          className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
        >

          {/* Avatar */}

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700 transition group-hover:bg-sky-200">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "A"}
          </div>

          {/* Name */}

          <div className="hidden text-left sm:block">

            <p className="text-sm font-semibold text-slate-800">
              {user?.name || "Administrator"}
            </p>

            <p className="text-xs capitalize text-slate-400">
              {user?.role || "admin"}
            </p>

          </div>

          {/* Arrow */}

          <FiChevronDown
            size={16}
            className="hidden text-slate-400 transition group-hover:text-slate-600 sm:block"
          />

        </button>

      </div>
    </header>
  );
}

export default Topbar;