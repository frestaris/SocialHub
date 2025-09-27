import { useState, useRef } from "react";

// --- Libraries ---
import {
  List,
  Avatar,
  Input,
  Button,
  Typography,
  Dropdown,
  Empty,
  Modal,
  Spin,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";

// --- Routing ---
import { Link } from "react-router-dom";

// --- Redux ---
import { useSelector } from "react-redux";
import {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../../redux/comment/commentApi";

// --- Utils ---
import {
  handleError,
  handleSuccess,
  handleWarning,
} from "../../utils/handleMessage";

// --- Libraries ---
import moment from "moment";
import PostDropdown from "../../components/post/PostDropdown";

const { Text } = Typography;

export default function CommentsSection({ postId }) {
  // --- Redux state ---
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id;

  // --- Local state ---
  const [content, setContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

  // --- API queries/mutations ---
  const { data, isLoading: isLoadingComments } =
    useGetCommentsByPostQuery(postId);
  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const textareaRef = useRef(null);
  const comments = data?.comments || [];

  // --- Derived state ---
  const isUnchanged =
    editingComment && content.trim() === editingComment.content.trim();

  // --- Expand/collapse toggle ---
  const toggleExpanded = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // --- Submit new comment ---
  const handleSubmit = async () => {
    if (!currentUser) {
      handleWarning("Login Required", "Please log in to comment.");
      return;
    }
    if (!content.trim()) {
      setError(true);
      handleError({ message: "Comment cannot be empty." }, "Empty Comment");
      return;
    }
    try {
      await createComment({ postId, content }).unwrap();
      handleSuccess("Your comment has been posted successfully.");
      setContent("");
    } catch (err) {
      handleError(err, "Failed to add comment");
    }
  };

  // --- Enter edit mode ---
  const handleEdit = (item) => {
    setEditingComment(item);
    setContent(item.content);

    // focus textarea after short delay
    setTimeout(() => {
      const el = textareaRef.current?.resizableTextArea?.textArea;
      if (el) el.focus({ preventScroll: true });
    }, 100);
  };

  // --- Update comment ---
  const handleUpdate = async () => {
    if (!editingComment) return;

    // Empty → ask to delete instead
    if (!content.trim()) {
      Modal.confirm({
        title: "Delete Comment?",
        content: "The comment is empty. Do you want to delete it instead?",
        okText: "Yes, delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            setDeletingId(editingComment._id);
            await deleteComment({ id: editingComment._id, postId }).unwrap();
            handleSuccess("Comment Deleted");
            setEditingComment(null);
            setContent("");
            setError(false);
          } catch (err) {
            handleError(err, "Delete Failed");
          } finally {
            setDeletingId(null);
          }
        },
      });
      return;
    }

    try {
      await updateComment({ id: editingComment._id, postId, content }).unwrap();
      handleSuccess("Comment Updated");
      setEditingComment(null);
      setContent("");
      setError(false);
    } catch (err) {
      handleError(err, "Update Failed");
    }
  };

  // --- Delete comment ---
  const handleDelete = async (commentId) => {
    try {
      setDeletingId(commentId);
      await deleteComment({ id: commentId, postId }).unwrap();
      handleSuccess("Comment Deleted");
    } catch (err) {
      handleError(err, "Delete Failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Input */}
      <Input.TextArea
        ref={textareaRef}
        rows={3}
        placeholder={
          editingComment ? "Edit your comment..." : "Add a comment..."
        }
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error && e.target.value.trim()) setError(false);
        }}
        style={{ marginBottom: 12, borderColor: error ? "red" : undefined }}
      />
      <Button
        type="primary"
        onClick={editingComment ? handleUpdate : handleSubmit}
        loading={isPosting || isUpdating}
        disabled={!currentUser || isUnchanged}
      >
        {editingComment ? "Update Comment" : "Comment"}
      </Button>

      {/* Loading Spinner */}
      {isLoadingComments && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Spin />
        </div>
      )}

      {/* Comment List */}
      <List itemLayout="horizontal" style={{ marginTop: 16 }}>
        {comments.slice(0, visibleCount).map((item) => (
          <div key={item._id} className="fade-slide-in">
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={
                      item.userId?.avatar && item.userId.avatar.trim() !== ""
                        ? item.userId.avatar
                        : null
                    }
                    icon={<UserOutlined />}
                  />
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* Left: name + timestamp */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 0, // lets name shrink
                      }}
                    >
                      <Link
                        to={`/profile/${item.userId?._id}`}
                        style={{
                          maxWidth: 120,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "inline-block",
                        }}
                      >
                        <Text style={{ color: "#1677ff" }} strong>
                          {item.userId?.username}
                        </Text>
                      </Link>

                      <Text
                        type="secondary"
                        style={{ fontSize: 12, whiteSpace: "nowrap" }}
                      >
                        {moment(item.createdAt).fromNow()}
                        {item.edited && (
                          <span style={{ marginLeft: 6 }}>(edited)</span>
                        )}
                      </Text>
                    </div>

                    {/* Right: action menu (only for owner) */}
                    {currentUserId === item.userId?._id && (
                      <PostDropdown
                        item={item}
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item._id)}
                        size="small"
                        loading={deletingId === item._id}
                      />
                    )}
                  </div>
                }
                description={
                  <>
                    {/* Content (collapsible) */}
                    <div
                      style={{
                        maxHeight: expandedComments[item._id]
                          ? "500px"
                          : "40px",
                        overflow: "hidden",
                        transition: "max-height 0.5s ease",
                      }}
                    >
                      <Typography.Paragraph
                        type="secondary"
                        style={{ marginBottom: 0 }}
                      >
                        {item.content}
                      </Typography.Paragraph>
                    </div>

                    {/* Toggle expand button */}
                    {item.content.length > 120 && (
                      <Button
                        type="link"
                        style={{ padding: 0, fontSize: 12 }}
                        onClick={() => toggleExpanded(item._id)}
                      >
                        {expandedComments[item._id] ? "Show Less" : "Show More"}
                      </Button>
                    )}
                  </>
                }
              />
            </List.Item>
          </div>
        ))}
      </List>

      {/* Show More / Less comments */}
      {comments.length > 3 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Button
            type="link"
            icon={
              visibleCount >= comments.length ? (
                <UpOutlined />
              ) : (
                <DownOutlined />
              )
            }
            onClick={() =>
              setVisibleCount((prev) =>
                prev >= comments.length ? 3 : prev + 3
              )
            }
          >
            {visibleCount >= comments.length ? "Show Less" : "Show More"}
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoadingComments && comments.length === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No comments yet"
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
}
