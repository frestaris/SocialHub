import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { chatApi } from "../redux/chat/chatApi";

export default function useChatSocket() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    let socketInstance;

    const init = async () => {
      // Ensure Firebase user
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
      window.chatSocket = socketInstance;

      // Join conversations
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

      // ✅ Only listen for new messages
      socketInstance.off("new_message").on("new_message", (msg) => {
        dispatch(
          chatApi.util.updateQueryData(
            "getMessages",
            msg.conversationId.toString(),
            (draft) => {
              // Find a matching optimistic message
              const idx = draft.findIndex(
                (m) =>
                  m.pending &&
                  m.sender?._id === msg.sender._id &&
                  m.content === msg.content
              );

              if (idx !== -1) {
                draft[idx] = msg; // replace optimistic
              } else {
                const exists = draft.some((m) => m._id === msg._id);
                if (!exists) {
                  draft.push(msg);
                }
              }
            }
          )
        );

        dispatch(
          chatApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              const conv = draft.conversations.find(
                (c) => c._id === msg.conversationId.toString()
              );
              if (conv) {
                // only update if this is actually newer
                if (!conv.lastMessage || conv.lastMessage._id !== msg._id) {
                  conv.lastMessage = msg;
                }
              }
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

  // ✅ Only sendMessage
  const sendMessage = (conversationId, content) => {
    socketRef.current?.emit("send_message", { conversationId, content });
  };

  return { sendMessage };
}
