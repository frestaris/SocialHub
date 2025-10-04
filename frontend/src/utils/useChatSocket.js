import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { chatApi } from "../redux/chat/chatApi";

/**
 * useChatSocket
 * -------------------------
 * - Connects to backend socket with Firebase token
 * - Joins all conversations of the logged-in user
 * - Listens for: new_message, typing, stop_typing, seen
 * - Provides emitters: sendMessage, markAsRead, startTyping, stopTyping
 */
export default function useChatSocket() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
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

      // 3️⃣ Connect to backend socket
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      socketInstance = io(baseURL, { auth: { token } });
      socketRef.current = socketInstance;
      window.chatSocket = socketInstance;

      // 4️⃣ Join conversations
      dispatch(
        chatApi.endpoints.getConversations.initiate(undefined, {
          subscribe: false,
        })
      )
        .unwrap()
        .then((res) => {
          const ids = res.conversations.map((c) => c._id);
          if (ids.length > 0) socketInstance.emit("join_conversations", ids);
        });

      // 5️⃣ Listen for new messages
      socketInstance.on("new_message", (msg) => {
        dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            msg.conversationId.toString(),
            (draft) => {
              draft.push(msg);
            }
          )
        );

        // update lastMessage in conversations
        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              const conv = draft.conversations.find(
                (c) => c._id === msg.conversationId.toString()
              );
              if (conv) conv.lastMessage = msg;
            }
          )
        );
      });

      // 6️⃣ Typing indicators
      socketInstance.on("typing", ({ userId, conversationId }) => {
        console.log("✍️ Typing:", userId, "in", conversationId);
      });

      socketInstance.on("stop_typing", ({ userId, conversationId }) => {
        console.log("🛑 Stop typing:", userId, "in", conversationId);
      });

      // 7️⃣ Seen receipts with timestamp
      socketInstance.on("seen", ({ conversationId, userId, seenAt }) => {
        console.log("👀 Seen event received:", {
          conversationId,
          userId,
          seenAt,
        });

        dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            conversationId,
            (draft) => {
              if (!draft) return;
              draft.forEach((m) => {
                if (!m.readBy) m.readBy = [];
                const readByIds = m.readBy.map((id) => id.toString());
                if (!readByIds.includes(userId.toString())) {
                  m.readBy.push(userId.toString());
                  m.seenAt = seenAt;
                }
              });
              console.log("✅ After seen update:", draft);
            }
          )
        );
      });
    };

    init();

    return () => {
      socketInstance?.disconnect();
    };
  }, [user?._id, dispatch]);

  // Emitters
  const sendMessage = (conversationId, content) => {
    socketRef.current?.emit("send_message", { conversationId, content });
  };

  const markAsRead = (conversationId) => {
    socketRef.current?.emit("mark_as_read", { conversationId });
  };

  const startTyping = (conversationId) => {
    socketRef.current?.emit("typing", { conversationId });
  };

  const stopTyping = (conversationId) => {
    socketRef.current?.emit("stop_typing", { conversationId });
  };

  return { sendMessage, markAsRead, startTyping, stopTyping };
}
