import { useState, useRef } from "react";
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
import moment from "moment";
import { useSelector } from "react-redux";
import {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../../redux/comment/commentApi";
import { Link } from "react-router-dom";
import {
  handleError,
  handleSuccess,
  handleWarning,
} from "../../utils/handleMessage";

const { Text } = Typography;

export default function CommentsSection({ postId }) {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id;

  const [content, setContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { data, isLoading: isLoadingComments } =
    useGetCommentsByPostQuery(postId);

  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const textareaRef = useRef(null);
  const comments = data?.comments || [];
  const [expandedComments, setExpandedComments] = useState({}); // 👈 track expanded per comment

  const isUnchanged =
    editingComment && content.trim() === editingComment.content.trim();

  const toggleExpanded = (id) => {
    setExpandedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // ---- Submit new comment ----
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

  // ---- Handle Edit ----
  const handleEdit = (item) => {
    setEditingComment(item);
    setContent(item.content);
    setTimeout(() => {
      const el = textareaRef.current?.resizableTextArea?.textArea;
      if (el) el.focus({ preventScroll: true });
    }, 100);
  };

  // ---- Handle Update ----
  const handleUpdate = async () => {
    if (!editingComment) return;

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

  // ---- Handle Delete ----
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

      {/* Spinner */}
      {isLoadingComments && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Spin />
        </div>
      )}

      {/* List */}
      <List itemLayout="horizontal" style={{ marginTop: 16 }}>
        {comments.slice(0, visibleCount).map((item) => (
          <div key={item._id} className="fade-slide-in">
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar src={item.userId?.avatar} icon={<UserOutlined />} />
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
                        minWidth: 0, // 🔑 allows flex children to shrink
                      }}
                    >
                      <Link
                        to={`/profile/${item.userId?._id}`}
                        style={{
                          maxWidth: 120, // 👈 adjust to what fits your layout
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

                    {/* Right: MoreOutlined */}
                    {currentUserId === item.userId?._id && (
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "edit",
                              label: "Edit",
                              icon: <EditOutlined />,
                              onClick: () => handleEdit(item),
                            },
                            {
                              key: "delete",
                              label: "Delete",
                              danger: true,
                              icon: <DeleteOutlined />,
                              onClick: () => handleDelete(item._id),
                            },
                          ],
                        }}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<MoreOutlined style={{ fontSize: 16 }} />}
                          shape="circle"
                          loading={deletingId === item._id}
                        />
                      </Dropdown>
                    )}
                  </div>
                }
                description={
                  <>
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
