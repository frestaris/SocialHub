import { List, Spin, Modal, Input } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  useDeleteConversationMutation,
  useGetConversationsQuery,
} from "../../redux/chat/chatApi";
import { handleSuccess, handleError } from "../../utils/handleMessage";
import { useDispatch, useSelector } from "react-redux";
import { setUnreadCounts } from "../../redux/chat/chatSlice";
import { useEffect, useMemo, useState } from "react";
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

  const [searchText, setSearchText] = useState("");

  // ✅ Hydrate unread counts on first load
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
  }, [conversations, unreadCounts, dispatch]);

  // ✅ Deletion confirm
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

  // Filter only by participant name
  const filteredConversations = useMemo(() => {
    if (!searchText.trim()) return conversations;
    const lower = searchText.toLowerCase();

    return conversations.filter((conv) =>
      (conv.participants || []).some(
        (p) =>
          p.username &&
          p.username.toLowerCase().includes(lower) &&
          p._id !== data?.userId
      )
    );
  }, [conversations, searchText, data?.userId]);

  const listContainerStyle = {
    boxSizing: "border-box",
    background: "#fff",
    height: "100%",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={listContainerStyle}>
      {/* Search bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          padding: "8px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Input.Search
          placeholder="Search by name..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{
            borderRadius: 8,
          }}
        />
      </div>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            height: "100%",
            paddingTop: 40,
          }}
        >
          <Spin />
        </div>
      ) : (
        <List
          dataSource={filteredConversations}
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
