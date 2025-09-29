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
  useCreateReplyMutation,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
} from "../../redux/reply/replyApi";
import {
  handleError,
  handleSuccess,
  handleWarning,
} from "../../utils/handleMessage";
import CommentItem from "./CommentItem";

export default function CommentsSection({ postId }) {
  // --- Local state ---
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(null); // can be comment OR reply
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
  const [createReply] = useCreateReplyMutation();
  const [updateReply] = useUpdateReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();

  const textareaRef = useRef(null);
  const comments = data?.comments || [];

  const isUnchanged = editing && content.trim() === editing.content?.trim();

  // --- Handlers ---
  const toggleExpanded = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = async () => {
    if (!currentUser)
      return handleWarning("Login Required", "Please log in to comment.");

    const trimmed = content.trim();

    // Editing + empty → ask delete
    if (editing && !trimmed) {
      Modal.confirm({
        title: "Delete?",
        content: "Content is empty. Do you want to delete instead?",
        okText: "Yes, delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            setDeletingId(editing._id);
            if (editing.parentId) {
              // reply
              await deleteReply({
                commentId: editing.parentId,
                replyId: editing._id,
                postId,
              }).unwrap();
            } else {
              // comment
              await deleteComment({ id: editing._id, postId }).unwrap();
            }
            handleSuccess("Deleted!");
            setEditing(null);
            setContent("");
          } catch (err) {
            handleError(err, "Failed to delete");
          } finally {
            setDeletingId(null);
          }
        },
      });
      return;
    }

    if (!editing && !trimmed) {
      setError(true);
      handleError({ message: "Content cannot be empty." }, "Empty");
      return;
    }

    // Normal create/update
    try {
      if (editing) {
        if (editing.parentId) {
          if (editing._id) {
            // ✅ update reply
            await updateReply({
              commentId: editing.parentId,
              replyId: editing._id,
              content: trimmed,
              postId,
            }).unwrap();
            handleSuccess("Reply updated!");
          } else {
            // ✅ create new reply
            await createReply({
              commentId: editing.parentId,
              postId,
              content: trimmed,
            }).unwrap();
            handleSuccess("Reply added!");
          }
        } else {
          if (editing._id) {
            // ✅ update comment
            await updateComment({
              id: editing._id,
              content: trimmed,
              postId,
            }).unwrap();
            handleSuccess("Comment updated!");
          }
        }
        setEditing(null);
      } else {
        // ✅ create comment
        await createComment({ postId, content: trimmed }).unwrap();
        handleSuccess("Comment added!");
      }
      setContent("");
    } catch (err) {
      handleError(err, "Save failed");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      setDeletingId(commentId);
      await deleteComment({ id: commentId, postId }).unwrap();
      handleSuccess("Comment deleted");
    } catch (err) {
      handleError(err, "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <Spin />;

  return (
    <div>
      <List
        dataSource={comments.slice(0, visibleCount)}
        locale={{ emptyText: <Empty description="No comments yet" /> }}
        renderItem={(item) => (
          <div key={item._id} style={{ marginBottom: 12 }}>
            {/* Top-level comment */}
            <CommentItem
              item={item}
              currentUser={currentUser}
              isOwner={currentUser?._id === item.userId?._id}
              expanded={expanded[item._id]}
              onToggleExpanded={() => toggleExpanded(item._id)}
              onEdit={(c) => {
                setEditing(c);
                setContent(c.content);
                textareaRef.current?.focus();
              }}
              onDelete={(id) => handleDelete(id, postId)}
              deleting={deletingId === item._id}
            />

            {/* Reply button always under the parent comment */}
            {currentUser && (
              <div style={{ paddingLeft: 56, marginTop: 4 }}>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setEditing({ parentId: item._id });
                    setContent("");
                    textareaRef.current?.focus();
                  }}
                >
                  Reply
                </Button>
              </div>
            )}

            {/* Replies container */}
            {item.replies?.length > 0 && (
              <div style={{ paddingLeft: 56, marginTop: 4 }}>
                <List
                  dataSource={item.replies}
                  renderItem={(reply) => (
                    <CommentItem
                      key={reply._id}
                      item={reply}
                      currentUser={currentUser}
                      isOwner={currentUser?._id === reply.userId?._id}
                      expanded={expanded[reply._id]}
                      onToggleExpanded={() => toggleExpanded(reply._id)}
                      onEdit={(r) => {
                        setEditing({ ...r, parentId: item._id });
                        setContent(r.content);
                        textareaRef.current?.focus();
                      }}
                      onDelete={(id) =>
                        deleteReply({
                          commentId: item._id,
                          replyId: id,
                          postId,
                        })
                      }
                      deleting={deletingId === reply._id}
                    />
                  )}
                />
              </div>
            )}
          </div>
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
          editing
            ? editing.parentId
              ? editing._id
                ? "Edit your reply..."
                : "Write a reply..."
              : "Edit your comment..."
            : "Write a comment..."
        }
        autoSize={{ minRows: 2, maxRows: 4 }}
        status={error ? "error" : ""}
        style={{ marginTop: 12 }}
      />

      <div style={{ marginTop: 8, textAlign: "right" }}>
        {editing && (
          <Button
            onClick={() => {
              setEditing(null);
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
          {editing ? (editing._id ? "Update" : "Reply") : "Comment"}
        </Button>
      </div>
    </div>
  );
}
