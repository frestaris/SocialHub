// --- React & Hooks ---
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// --- Ant Design ---
import { List, Spin, Modal, Input } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

// --- Redux Logic ---
import {
  useDeleteConversationMutation,
  useGetConversationsQuery,
} from "../../redux/chat/chatApi";
import { setUnreadCounts } from "../../redux/chat/chatSlice";

// --- Utils ---
import { handleSuccess, handleError } from "../../utils/handleMessage";

// --- Components ---
import ChatListItem from "./ChatListItem";

/**
 *
 * --------------------------
 * Displays the user’s list of conversations inside the chat dock or mobile drawer.
 * Handles:
 *  - Fetching conversations
 *  - Hydrating unread counts
 *  - Deleting conversations
 *  - Searching by participant name
 *  - Sorting: unread first, then most recent
 */
export default function ChatList({
  onSelectConversation,
  enabled,
  userStatus,
}) {
  // Load conversations only when the list is enabled (drawer open)
  const { data, isLoading } = useGetConversationsQuery(undefined, {
    skip: !enabled,
  });

  // Extract conversation list safely
  const conversations = useMemo(
    () => data?.conversations || [],
    [data?.conversations]
  );

  const unreadCounts = useSelector((s) => s.chat.unread);
  const dispatch = useDispatch();
  const [deleteConversation] = useDeleteConversationMutation();

  const [searchText, setSearchText] = useState("");

  /**
   * Hydrate unread counts on mount
   * If the Redux store is missing some conversation IDs,
   * we sync them from the backend’s unreadCount field.
   */
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

  /**
   * Confirm and delete a conversation
   * Only removes it from the current user’s chat list (doesn’t delete for both).
   */
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

  /**
   * Filter & Sort Conversations
   * - Filter by participant username
   * - Sort unread first, then latest activity
   */
  const filteredConversations = useMemo(() => {
    if (!conversations?.length) return [];

    const list = conversations.map((conv) => ({
      ...conv,
      unreadCount: unreadCounts?.[conv._id] || conv.unreadCount || 0,
      lastActivity:
        conv.lastMessage?.createdAt || conv.updatedAt || conv.createdAt,
    }));

    const lower = searchText.trim().toLowerCase();

    // Filter by name, excluding self
    const filtered = lower
      ? list.filter((conv) =>
          (conv.participants || []).some(
            (p) =>
              p.username &&
              p.username.toLowerCase().includes(lower) &&
              p._id !== data?.userId
          )
        )
      : list;

    // Sort unread first → then newest activity
    return filtered.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });
  }, [conversations, unreadCounts, searchText, data?.userId]);

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
          style={{ borderRadius: 8 }}
        />
      </div>

      {/* Loading / Empty state */}
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
              isUnread={(conv.unreadCount || 0) > 0}
            />
          )}
        />
      )}
    </div>
  );
}
