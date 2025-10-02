import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { notificationApi } from "../redux/notification/notificationApi";

export default function useNotificationsSocket() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?._id) return;

    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const socket = io(baseURL, { withCredentials: true });

    socket.on("connect", () => {
      // Join after connection established
      socket.emit("join", user._id);
    });

    socket.on("notification", (notif) => {
      console.log("📩 Notification received:", notif);
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
