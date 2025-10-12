import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { notificationApi } from "../../redux/notification/notificationApi";

/**
 * useNotificationsSocket
 * -------------------------
 * - Custom hook that connects to the backend socket server
 * - Authenticates with Firebase ID token
 * - Listens for "notification" events
 * - Updates Redux RTK Query cache in real time
 */
export default function useNotificationsSocket() {
  const user = useSelector((s) => s.auth.user); // logged-in Mongo user
  const dispatch = useDispatch();

  useEffect(() => {
    // if no Mongo user in Redux, don’t connect
    if (!user?._id) return;

    let socketInstance;

    const init = async () => {
      // 1️⃣ Ensure Firebase user is ready
      let firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        await new Promise((resolve) => {
          const unsub = onAuthStateChanged(auth, (u) => {
            if (u) {
              firebaseUser = u;
              unsub();
              resolve();
            }
          });
        });
      }

      // 2️⃣ Get fresh Firebase ID token
      const token = await firebaseUser.getIdToken();

      // 3️⃣ Connect to backend socket with token in handshake.auth
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      socketInstance = io(baseURL, {
        auth: { token },
        transports: ["websocket"],
        path: "/socket.io",
      });

      // 4️⃣ Listen for incoming notifications
      socketInstance.on("notification", (notif) => {
        if (notif.userId?.toString() === user._id?.toString()) {
          // update local cache immediately
          dispatch(
            notificationApi.util.updateQueryData(
              "getNotifications",
              undefined,
              (draft) => {
                draft.notifications = [
                  { ...notif, isRead: notif.isRead ?? false },
                  ...(draft.notifications || []),
                ];
              }
            )
          );

          // then trigger refetch for reliability
          dispatch(notificationApi.util.invalidateTags(["Notification"]));
        }
      });
    };

    init();

    // 5️⃣ Cleanup on unmount or user change
    return () => {
      socketInstance?.disconnect();
    };
  }, [user?._id, dispatch]);
}
