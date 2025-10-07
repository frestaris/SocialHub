import { List, Spin, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  useDeleteConversationMutation,
  useGetConversationsQuery,
} from "../../redux/chat/chatApi";
import { handleSuccess, handleError } from "../../utils/handleMessage";
import { useDispatch, useSelector } from "react-redux";
import { setUnreadCounts } from "../../redux/chat/chatSlice";
import { useEffect, useMemo } from "react";
import ChatListItem from "./ChatListItem";

export default function ChatList({
  onSelectConversation,
  enabled,
  userStatus,
}) {
  const { data, isLoading } = useGetConversationsQuery(undefined, {
    skip: !enabled,
  });

  const conversations = useMemo(
    () => data?.conversations || [],
    [data?.conversations]
  );

  const unreadCounts = useSelector((s) => s.chat.unread);
  const dispatch = useDispatch();
  const [deleteConversation] = useDeleteConversationMutation();

  // Hydrate unread counts from backend on first load
  useEffect(() => {
    if (!conversations?.length) return;

    const missing = {};
    conversations.forEach((c) => {
      if (unreadCounts[c._id] === undefined) {
        missing[c._id] = c.unreadCount || 0;
      }
    });

    if (Object.keys(missing).length > 0) {
      dispatch(setUnreadCounts({ ...unreadCounts, ...missing }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, dispatch]);

  // Deletion confirm stays here (no behavior change)
  const handleDelete = (conversationId) => {
    Modal.confirm({
      title: "Delete Conversation",
      icon: <ExclamationCircleOutlined />,
      content:
        "Are you sure you want to delete this chat? This will remove it only from your chat list.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await deleteConversation(conversationId).unwrap();
          handleSuccess("Conversation deleted");
        } catch (err) {
          console.error("Delete conversation error:", err);
          handleError("Failed to delete conversation");
        }
      },
    });
  };

  const listContainerStyle = {
    padding: "5px",
    boxSizing: "border-box",
    background: "#fff",
    height: "100%",
    overflowY: "auto",
  };

  return (
    <div style={listContainerStyle}>
      {isLoading ? (
        <Spin style={{ marginTop: 40 }} />
      ) : (
        <List
          dataSource={conversations}
          renderItem={(conv) => (
            <ChatListItem
              conv={conv}
              userId={data?.userId}
              unreadCounts={unreadCounts}
              userStatus={userStatus}
              onSelect={onSelectConversation}
              onDelete={handleDelete}
            />
          )}
        />
      )}
    </div>
  );
}
