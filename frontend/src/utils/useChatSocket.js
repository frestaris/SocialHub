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

  useEffect(() => {
    if (!user?._id) return;

    // 🚫 If already connected for this user, reuse — do not re-init
    if (globalSocket?.connected && globalSocket.userId === user._id) {
      console.log(
        "♻️ useChatSocket: already connected, skipping init",
        globalSocket.id
      );
      socketRef.current = globalSocket;
      return;
    }

    // ✅ If there's an old disconnected socket, clean it
    if (globalSocket && !globalSocket.connected) {
      console.log("🧹 Cleaning stale global socket before init");
      globalSocket.off();
      globalSocket = null;
    }

    const init = async () => {
      console.log("💬 useChatSocket useEffect fired", { user: user._id });
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
      window.chatSocket = socketInstance; // 🔍 for debugging

      // 🧠 Connection lifecycle
      socketInstance.on("connect", () => {
        console.log("✅ Chat socket connected:", socketInstance.id);
        // Fetch conversations and join them
        dispatch(
          chatApi.endpoints.getConversations.initiate(undefined, {
            subscribe: false,
          })
        )
          .unwrap()
          .then((res) => {
            const ids = (res?.conversations || []).map((c) => c._id);
            if (ids.length > 0) {
              socketInstance.emit("join_conversations", ids, (ack) => {
                console.log("👥 join_conversations ack:", ack);
              });
            }
          })
          .catch((err) => console.warn("join_conversations error:", err));
      });

      socketInstance.on("disconnect", (reason) => {
        console.warn("❌ Chat socket disconnected:", reason);
      });

      // ==============================
      // 🔔 Socket Listeners
      // ==============================

      // 🆕 New message received
      socketInstance.off("new_message").on("new_message", (msg) => {
        const convId = msg.conversationId?.toString?.() || msg.conversationId;

        // Update message list cache
        dispatch(
          chatApi.util.updateQueryData("getMessages", convId, (draft = []) => {
            const optimisticIdx = draft.findIndex(
              (m) =>
                m.pending &&
                m.sender?._id === msg.sender._id &&
                m.content === msg.content
            );

            if (optimisticIdx !== -1) {
              // 🟢 Replace the optimistic message with the confirmed one
              draft[optimisticIdx] = msg;
            } else if (!draft.some((m) => m._id === msg._id)) {
              // 🟢 If it’s a new message from someone else, just push it
              draft.push(msg);
            }
          })
        );

        // Update conversation preview
        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              const conv = draft?.conversations?.find((c) => c._id === convId);
              if (conv) conv.lastMessage = msg;
            }
          )
        );

        // Increment unread count (only if not mine / not open)
        if (msg.sender._id !== user._id && convId !== activeConversationId) {
          dispatch(incrementUnread(convId));
        }
      });
      // Create conversation
      socketInstance.off("new_conversation").on("new_conversation", (conv) => {
        console.log("💬 new_conversation received:", conv);

        // Append conversation to getConversations cache if not already there
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
        if (conv?._id) {
          socketInstance.emit("join_conversations", [conv._id], (ack) => {
            console.log("👥 Auto-joined new room:", ack);
          });
        }
      });
      // 🔔 Chat alert (background message notification)
      socketInstance.off("chat_alert").on("chat_alert", (data) => {
        if (data.fromUser._id === user._id) return;

        // Prevent double increment if same conversation already updated by new_message
        const lastAlertKey = `${data.conversationId}-${data.fromUser._id}`;
        if (socketInstance.lastAlert === lastAlertKey) return;
        socketInstance.lastAlert = lastAlertKey;

        if (data.conversationId !== activeConversationId)
          dispatch(incrementUnread(data.conversationId));
      });

      // 👀 Seen updates
      socketInstance.off("seen").on("seen", ({ conversationId, userId }) => {
        console.log("👀 seen event:", { conversationId, userId });
        const convId = conversationId?.toString?.() || conversationId;
        const seenUser = userId?.toString?.() || userId;

        // Update messages
        dispatch(
          chatApi.util.updateQueryData("getMessages", convId, (draft = []) => {
            draft.forEach((m) => {
              if (!Array.isArray(m.readBy)) m.readBy = [];
              if (!m.readBy.map(String).includes(seenUser))
                m.readBy.push(userId);
            });
          })
        );

        // Update last message
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

        // If I’m the one marking as read → clear local unread
        if (seenUser === user._id.toString()) dispatch(clearUnread(convId));
      });

      // Hide conversation (remove from local list)
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

      // ✍️ Typing indicators
      socketInstance
        .off("typing")
        .on("typing", ({ conversationId, userId }) => {
          console.log("✍️ typing:", { conversationId, userId });
          dispatch(setTyping({ conversationId, userId, isTyping: true }));
        });

      socketInstance
        .off("stop_typing")
        .on("stop_typing", ({ conversationId, userId }) => {
          console.log("🛑 stop_typing:", { conversationId, userId });
          dispatch(setTyping({ conversationId, userId, isTyping: false }));
        });
      // 🟢 User Online / Offline Presence
      socketInstance.off("user_online").on("user_online", (data) => {
        console.log("🟢 user_online:", data);
        dispatch(setUserStatus({ userId: data.userId, online: true }));
      });
      // Toggle status
      socketInstance
        .off("user_status_update")
        .on("user_status_update", (data) => {
          console.log("🟢 user_status_update:", data);
          dispatch(setUserStatus(data));
        });

      socketInstance.off("user_offline").on("user_offline", (data) => {
        console.log("🔴 user_offline:", data);
        dispatch(
          setUserStatus({
            userId: data.userId,
            online: false,
            lastSeen: data.lastSeen,
          })
        );
      });
    };

    init();

    // ⚠️ Do NOT destroy the socket on component re-render.
    // Only disconnect when the user logs out.
    return () => {
      if (!user?._id && socketRef.current) {
        console.log("👋 User logged out → closing socket");
        socketRef.current.off();
        socketRef.current.disconnect();
        socketRef.current = null;
        globalSocket = null;
      } else {
        console.log("♻️ Skipping socket cleanup (still same user)");
      }
    };
  }, [user?._id, dispatch, activeConversationId]);

  // ==============================
  // EMITTERS
  // ==============================
  const sendMessage = (conversationId, content) => {
    if (!socketRef.current) return;
    console.log("📤 Sending message:", { conversationId, content });
    socketRef.current.emit(
      "send_message",
      { conversationId, content },
      (ack) => {
        console.log("📨 send_message ack:", ack);
      }
    );
  };

  const markAsRead = (conversationId) => {
    if (!socketRef.current) return;
    console.log("👁️ markAsRead:", conversationId);
    socketRef.current.emit("mark_as_read", { conversationId }, (ack) => {
      console.log("👁️ mark_as_read ack:", ack);
    });
  };

  const startTyping = (conversationId) => {
    socketRef.current?.emit("typing", { conversationId });
  };

  const stopTyping = (conversationId) => {
    socketRef.current?.emit("stop_typing", { conversationId });
  };

  const joinConversation = (conversationId) => {
    if (!socketRef.current) return;
    console.log("👥 join_conversation:", conversationId);
    socketRef.current.emit("join_conversations", [conversationId], (ack) => {
      console.log("👥 join_conversations ack:", ack);
    });
  };

  return {
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    joinConversation,
  };
}
// Keep global helpers so you don’t mount the hook in per-window components
export const chatSocketHelpers = {
  sendMessage: (conversationId, content) => {
    console.log("📤 Sending message:", { conversationId, content });
    globalSocket?.emit("send_message", { conversationId, content }, (ack) =>
      console.log("📨 send_message ack:", ack)
    );
  },
  markAsRead: (conversationId) => {
    console.log("👁️ markAsRead:", conversationId);
    globalSocket?.emit("mark_as_read", { conversationId }, (ack) =>
      console.log("👁️ mark_as_read ack:", ack)
    );
  },
  startTyping: (conversationId) => {
    globalSocket?.emit("typing", { conversationId });
  },
  stopTyping: (conversationId) => {
    globalSocket?.emit("stop_typing", { conversationId });
  },
  joinConversation: (conversationId) => {
    console.log("👥 join_conversation:", conversationId);
    globalSocket?.emit("join_conversations", [conversationId], (ack) =>
      console.log("👥 join_conversations ack:", ack)
    );
  },
  emit: (event, data, callback) => {
    if (!globalSocket) {
      console.warn("⚠️ No active socket connection");
      return;
    }
    console.log(`📡 Emitting [${event}] with data:`, data);
    globalSocket.emit(event, data, callback);
  },
};
