import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { chatApi } from "../redux/chat/chatApi";
import {
  incrementUnread,
  clearUnread,
  setTyping,
  setUserStatus,
} from "../redux/chat/chatSlice";

// ✅ Keep a global singleton socket
let globalSocket = null;

export default function useChatSocket() {
  const user = useSelector((s) => s.auth.user);
  const activeConversationId = useSelector((s) => s.chat.activeConversationId);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  // 🧠 keep current conversation id fresh (without re-mounting listeners)
  const activeConversationRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!user?._id) return;

    // ✅ Reuse if same user already connected
    if (globalSocket?.connected && globalSocket.userId === user._id) {
      socketRef.current = globalSocket;
      return;
    }

    // 🧹 Clean any existing global socket before new init
    if (globalSocket) {
      globalSocket.off();
      globalSocket.disconnect();
      globalSocket = null;
    }

    const init = async () => {
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

      const token = await firebaseUser.getIdToken(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL;

      const socketInstance = io(baseURL, {
        auth: { token },
        transports: ["websocket"],
      });

      globalSocket = socketInstance;
      globalSocket.userId = user._id;
      socketRef.current = socketInstance;
      window.chatSocket = socketInstance; // (dev inspection only)

      // -------------------------------
      // 🔌 Connection lifecycle
      // -------------------------------
      socketInstance.on("connect", () => {
        dispatch(
          chatApi.endpoints.getConversations.initiate(undefined, {
            subscribe: false,
          })
        )
          .unwrap()
          .then((res) => {
            const ids = (res?.conversations || []).map((c) => c._id);
            if (ids.length > 0) socketInstance.emit("join_conversations", ids);
          })
          .catch((err) => console.warn("join_conversations error:", err));
      });

      socketInstance.on("disconnect", (reason) => {
        console.warn("❌ Chat socket disconnected:", reason);
      });

      // -------------------------------
      // 📡 Event listeners
      // -------------------------------

      // 🆕 New message
      socketInstance.off("new_message").on("new_message", (msg) => {
        const convId = msg.conversationId?.toString?.() || msg.conversationId;

        // Update messages cache
        dispatch(
          chatApi.util.updateQueryData("getMessages", convId, (draft = []) => {
            const optimisticIdx = draft.findIndex(
              (m) =>
                m.pending &&
                m.sender?._id === msg.sender._id &&
                m.content === msg.content
            );

            if (optimisticIdx !== -1) draft[optimisticIdx] = msg;
            else if (!draft.some((m) => m._id === msg._id)) draft.push(msg);
          })
        );

        // Update conversation preview
        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              if (!draft?.conversations) return;

              // Find the conversation
              const idx = draft.conversations.findIndex(
                (c) => c._id === convId
              );
              const conv = draft.conversations[idx];

              if (conv) {
                // Update last message
                conv.lastMessage = msg;
                conv.updatedAt = new Date().toISOString();

                // Move conversation to top
                draft.conversations.splice(idx, 1);
                draft.conversations.unshift(conv);
              }
            }
          )
        );

        // Unread count
        if (
          msg.sender._id !== user._id &&
          convId !== activeConversationRef.current
        ) {
          dispatch(incrementUnread(convId));
        }
      });

      // 🆕 New conversation
      socketInstance.off("new_conversation").on("new_conversation", (conv) => {
        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              if (!draft?.conversations) return;
              const exists = draft.conversations.some(
                (c) => c._id === conv._id
              );
              if (!exists) draft.conversations.unshift(conv);
            }
          )
        );
        if (conv?._id) socketInstance.emit("join_conversations", [conv._id]);
      });

      // 🔔 Background chat alert
      socketInstance.off("chat_alert").on("chat_alert", (data) => {
        if (data.fromUser._id === user._id) return;
        const key = `${data.conversationId}-${data.fromUser._id}`;
        if (socketInstance.lastAlert === key) return;
        socketInstance.lastAlert = key;
        if (data.conversationId !== activeConversationRef.current)
          dispatch(incrementUnread(data.conversationId));
      });

      // 👀 Seen updates (deduplicated)
      let lastSeenKey = null;
      socketInstance.off("seen").on("seen", ({ conversationId, userId }) => {
        const key = `${conversationId}-${userId}`;
        if (lastSeenKey === key) return;
        lastSeenKey = key;

        const convId = conversationId?.toString?.() || conversationId;
        const seenUser = userId?.toString?.() || userId;

        dispatch(
          chatApi.util.updateQueryData("getMessages", convId, (draft = []) => {
            draft.forEach((m) => {
              if (!Array.isArray(m.readBy)) m.readBy = [];
              if (!m.readBy.map(String).includes(seenUser))
                m.readBy.push(userId);
            });
          })
        );

        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              const conv = draft?.conversations?.find((c) => c._id === convId);
              if (conv?.lastMessage) {
                if (!Array.isArray(conv.lastMessage.readBy))
                  conv.lastMessage.readBy = [];
                if (!conv.lastMessage.readBy.map(String).includes(seenUser))
                  conv.lastMessage.readBy.push(userId);
              }
            }
          )
        );

        if (seenUser === user._id.toString()) dispatch(clearUnread(convId));
      });

      // 🗑️ Conversation hidden
      socketInstance
        .off("conversation_hidden")
        .on("conversation_hidden", ({ conversationId }) => {
          dispatch(
            chatApi.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                if (!draft?.conversations) return;
                draft.conversations = draft.conversations.filter(
                  (c) => c._id !== conversationId
                );
              }
            )
          );
        });

      // ✍️ Typing
      socketInstance
        .off("typing")
        .on("typing", ({ conversationId, userId }) => {
          dispatch(setTyping({ conversationId, userId, isTyping: true }));
        });

      socketInstance
        .off("stop_typing")
        .on("stop_typing", ({ conversationId, userId }) => {
          dispatch(setTyping({ conversationId, userId, isTyping: false }));
        });

      // 🟢 User status
      socketInstance.off("user_online").on("user_online", (data) => {
        dispatch(setUserStatus({ userId: data.userId, online: true }));
      });
      socketInstance
        .off("user_status_update")
        .on("user_status_update", (data) => {
          dispatch(setUserStatus(data));
        });
      socketInstance.off("user_offline").on("user_offline", (data) => {
        dispatch(
          setUserStatus({
            userId: data.userId,
            online: false,
            lastSeen: data.lastSeen,
          })
        );
      });
      socketInstance
        .off("online_users_snapshot")
        .on("online_users_snapshot", (users) => {
          if (!Array.isArray(users)) return;
          users.forEach((u) => {
            dispatch(setUserStatus({ userId: u.userId, online: true }));
          });
        });
      // Handle deleted messages
      socketInstance
        .off("message_deleted")
        .on("message_deleted", ({ conversationId, messageId }) => {
          // 1️⃣ Update messages cache
          dispatch(
            chatApi.util.updateQueryData(
              "getMessages",
              conversationId,
              (draft = []) => {
                const msg = draft.find((m) => m._id === messageId);
                if (msg) {
                  msg.deleted = true;
                  msg.content = "";
                }
              }
            )
          );

          // 2️⃣ Update conversation preview
          dispatch(
            chatApi.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                const conv = draft?.conversations?.find(
                  (c) => c._id === conversationId
                );
                if (conv?.lastMessage?._id === messageId) {
                  conv.lastMessage.deleted = true;
                  conv.lastMessage.content = "This message was deleted";
                }
              }
            )
          );
        });
      // Edited message
      socketInstance
        .off("message_edited")
        .on("message_edited", ({ conversationId, messageId, message }) => {
          dispatch(
            chatApi.util.updateQueryData(
              "getMessages",
              conversationId,
              (draft = []) => {
                const msg = draft.find((m) => m._id === messageId);
                if (msg) {
                  msg.content = message.content;
                  msg.edited = true;
                }
              }
            )
          );

          dispatch(
            chatApi.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                const conv = draft?.conversations?.find(
                  (c) => c._id === conversationId
                );
                if (conv?.lastMessage?._id === messageId) {
                  conv.lastMessage.content = message.content;
                  conv.lastMessage.edited = true;
                }
              }
            )
          );
        });
    };

    init();

    // Cleanup only when user logs out
    return () => {
      if (!user?._id && socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
        socketRef.current = null;
        globalSocket = null;
      }
    };
  }, [user?._id, dispatch]);

  // -------------------------------
  // ✉️ Emitters
  // -------------------------------
  const sendMessage = (conversationId, content) =>
    socketRef.current?.emit("send_message", { conversationId, content });

  const markAsRead = (conversationId) =>
    socketRef.current?.emit("mark_as_read", { conversationId });

  const startTyping = (conversationId) =>
    socketRef.current?.emit("typing", { conversationId });

  const stopTyping = (conversationId) =>
    socketRef.current?.emit("stop_typing", { conversationId });

  const joinConversation = (conversationId) =>
    socketRef.current?.emit("join_conversations", [conversationId]);

  return {
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    joinConversation,
  };
}

// =====================================================
// 🔧 Global helpers (for use outside React components)
// =====================================================
export const chatSocketHelpers = {
  sendMessage: (conversationId, content) =>
    globalSocket?.emit("send_message", { conversationId, content }),
  markAsRead: (conversationId) =>
    globalSocket?.emit("mark_as_read", { conversationId }),
  startTyping: (conversationId) =>
    globalSocket?.emit("typing", { conversationId }),
  stopTyping: (conversationId) =>
    globalSocket?.emit("stop_typing", { conversationId }),
  joinConversation: (conversationId) =>
    globalSocket?.emit("join_conversations", [conversationId]),
  emit: (event, data, callback) => {
    if (!globalSocket) {
      console.warn("⚠️ No active socket connection");
      return;
    }
    globalSocket.emit(event, data, callback);
  },
};
