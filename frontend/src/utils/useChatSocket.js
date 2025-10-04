import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { chatApi } from "../redux/chat/chatApi";
import { incrementUnread, clearUnread } from "../redux/chat/chatSlice";

export default function useChatSocket() {
  const user = useSelector((s) => s.auth.user);
  const activeConversationId = useSelector((s) => s.chat.activeConversationId);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    let socketInstance;

    const init = async () => {
      // ✅ Ensure Firebase user is available
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

      const token = await firebaseUser.getIdToken();
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      socketInstance = io(baseURL, { auth: { token } });
      socketRef.current = socketInstance;
      window.chatSocket = socketInstance; // 🔍 optional debugging

      // ✅ Join all user conversations after connecting
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
        .catch(() => {});

      // ✅ Listen for new messages
      socketInstance.off("new_message").on("new_message", (msg) => {
        const convIdStr =
          msg.conversationId?.toString?.() || msg.conversationId;

        // Update message list cache
        dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            convIdStr,
            (draft = []) => {
              // 🟢 Check for optimistic message match
              const optimisticIdx = draft.findIndex(
                (m) =>
                  m.pending &&
                  m.sender?._id === msg.sender._id &&
                  m.content === msg.content
              );

              if (optimisticIdx !== -1) {
                // Replace optimistic one with the real message
                draft[optimisticIdx] = msg;
              } else {
                // Only add if it doesn’t already exist
                const exists = draft.some((m) => m._id === msg._id);
                if (!exists) draft.push(msg);
              }
            }
          )
        );

        // Update last message preview in conversations list
        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              const conv = draft?.conversations?.find(
                (c) => c._id === convIdStr
              );
              if (conv) conv.lastMessage = msg;
            }
          )
        );

        // Increment unread count if it's not from me or the active chat
        if (msg.sender._id !== user._id && convIdStr !== activeConversationId) {
          dispatch(incrementUnread(convIdStr));
        }
      });

      // ✅ Handle chat alerts (new message notifications)
      socketInstance.off("chat_alert").on("chat_alert", (data) => {
        // Don't show if it’s your own message
        if (data.fromUser._id === user._id) return;

        // Increment unread for that conversation
        if (data.conversationId !== activeConversationId) {
          dispatch(incrementUnread(data.conversationId));
        }
      });

      // ✅ Handle seen updates
      // ✅ Handle seen updates: update caches so ticks flip immediately
      socketInstance.off("seen").on("seen", ({ conversationId, userId }) => {
        const convIdStr = conversationId?.toString?.() || conversationId;
        const seenUserStr = userId?.toString?.() || userId;

        // Update messages cache: add seenUser to readBy for all messages
        dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            convIdStr,
            (draft = []) => {
              draft.forEach((m) => {
                if (!Array.isArray(m.readBy)) m.readBy = [];
                const has = m.readBy.map(String).includes(seenUserStr);
                if (!has) m.readBy.push(userId);
              });
            }
          )
        );

        // Update conversations cache: ensure lastMessage.readBy includes seen user
        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              const conv = draft?.conversations?.find(
                (c) => c._id === convIdStr
              );
              if (conv?.lastMessage) {
                if (!Array.isArray(conv.lastMessage.readBy))
                  conv.lastMessage.readBy = [];
                const has = conv.lastMessage.readBy
                  .map(String)
                  .includes(seenUserStr);
                if (!has) conv.lastMessage.readBy.push(userId);
              }
            }
          )
        );

        // If *I* am the one who just marked as read, clear the local unread badge too
        if (seenUserStr === (user?._id?.toString?.() || user?._id)) {
          dispatch(clearUnread(convIdStr));
        }
      });
    };

    init();

    return () => {
      socketInstance?.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, dispatch, activeConversationId]);

  // ✅ Emitters
  const sendMessage = (conversationId, content) => {
    socketRef.current?.emit("send_message", { conversationId, content });
  };

  const markAsRead = (conversationId) => {
    socketRef.current?.emit("mark_as_read", { conversationId });
  };

  return { sendMessage, markAsRead };
}
