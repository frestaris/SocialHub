import { useState, useRef } from "react";
import { List, Input, Button, Empty, Spin, Modal } from "antd";
import { useSelector } from "react-redux";
import {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../../redux/comment/commentApi";
import {
  handleError,
  handleSuccess,
  handleWarning,
} from "../../utils/handleMessage";
import CommentItem from "./CommentItem";

/**
 * CommentsSection:
 * - Lists comments for a post (query)
 * - Allows create, edit, delete (mutations)
 * - Supports expand/collapse and pagination (Show More)
 */
export default function CommentsSection({ postId }) {
  // --- Local state ---
  const [content, setContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [expanded, setExpanded] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(false);

  // --- Redux ---
  const currentUser = useSelector((s) => s.auth.user);

  // --- API ---
  const { data, isLoading } = useGetCommentsByPostQuery(postId);
  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const textareaRef = useRef(null);
  const comments = data?.comments || [];

  // --- Derived ---
  const isUnchanged =
    editingComment && content.trim() === editingComment.content.trim();

  // --- Handlers ---
  const toggleExpanded = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = async () => {
    if (!currentUser)
      return handleWarning("Login Required", "Please log in to comment.");

    const trimmed = content.trim();

    // --- Case 2: editing and empty ---
    if (editingComment && !trimmed) {
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
            handleSuccess("Comment deleted!");
            setEditingComment(null);
            setContent("");
          } catch (err) {
            handleError(err, "Failed to delete comment");
          } finally {
            setDeletingId(null);
          }
        },
      });
      return;
    }

    // --- Case 1: creating and empty ---
    if (!editingComment && !trimmed) {
      setError(true);
      handleError({ message: "Comment cannot be empty." }, "Empty Comment");
      return;
    }

    // --- Normal update/create ---
    try {
      if (editingComment) {
        await updateComment({
          id: editingComment._id,
          content: trimmed,
        }).unwrap();
        handleSuccess("Comment updated!");
        setEditingComment(null);
      } else {
        await createComment({ postId, content: trimmed }).unwrap();
        handleSuccess("Comment added!");
      }
      setContent("");
    } catch (err) {
      handleError(err, "Failed to save comment");
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

  // --- Render ---
  if (isLoading) return <Spin />;

  return (
    <div>
      <List
        dataSource={comments.slice(0, visibleCount)}
        locale={{ emptyText: <Empty description="No comments yet" /> }}
        renderItem={(item) => (
          <CommentItem
            key={item._id}
            item={item}
            isOwner={currentUser?._id === item.userId?._id}
            expanded={expanded[item._id]}
            onToggleExpanded={() => toggleExpanded(item._id)}
            onEdit={(c) => {
              setEditingComment(c);
              setContent(c.content);
              textareaRef.current?.focus();
            }}
            onDelete={(id) => handleDelete(id, postId)}
            deleting={deletingId === item._id}
          />
        )}
      />

      {comments.length > visibleCount && (
        <Button
          type="link"
          onClick={() => setVisibleCount((c) => c + 3)}
          style={{ marginTop: 8 }}
        >
          Show more
        </Button>
      )}

      <Input.TextArea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError(false);
        }}
        placeholder={
          editingComment ? "Edit your comment..." : "Write a comment..."
        }
        autoSize={{ minRows: 2, maxRows: 4 }}
        status={error ? "error" : ""}
        style={{ marginTop: 12 }}
      />

      <div style={{ marginTop: 8, textAlign: "right" }}>
        {editingComment && (
          <Button
            onClick={() => {
              setEditingComment(null);
              setContent("");
            }}
            style={{ marginRight: 8 }}
          >
            Cancel
          </Button>
        )}
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={isPosting || isUpdating}
          disabled={isUnchanged}
        >
          {editingComment ? "Update" : "Comment"}
        </Button>
      </div>
    </div>
  );
}
