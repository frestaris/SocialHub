import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { notificationApi } from "../redux/notification/notificationApi";

let socket;

export default function useNotificationsSocket() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?._id) return;

    const baseURL = import.meta.env.VITE_API_BASE_URL;

    // Connect socket
    socket = io(baseURL, { withCredentials: true });

    // Join personal room
    socket.emit("join", user._id);

    // Listen for notifications
    socket.on("notification", (notif) => {
      // Update RTK Query cache instantly
      dispatch(
        notificationApi.util.updateQueryData(
          "getNotifications",
          undefined,
          (draft) => {
            if (!draft.notifications) draft.notifications = [];
            draft.notifications.unshift(notif);
          }
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, dispatch]);
}
