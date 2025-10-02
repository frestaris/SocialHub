import { useEffect, useRef, useState } from "react";
import { Button, Spin } from "antd";
import { useSelector } from "react-redux";
import {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useToggleLikeCommentMutation,
} from "../../../redux/comment/commentApi";
import {
  useCreateReplyMutation,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
  useToggleLikeReplyMutation,
} from "../../../redux/reply/replyApi";
import {
  handleError,
  handleSuccess,
  handleWarning,
} from "../../../utils/handleMessage";

import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import { useLocation } from "react-router-dom";

export default function CommentsSection({ postId }) {
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [editing, setEditing] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const [expanded, setExpanded] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(false);

  const currentUser = useSelector((s) => s.auth.user);

  const { data, isLoading } = useGetCommentsByPostQuery(postId);
  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [createReply] = useCreateReplyMutation();
  const [updateReply] = useUpdateReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();
  const [toggleLikeComment] = useToggleLikeCommentMutation();
  const [toggleLikeReply] = useToggleLikeReplyMutation();

  const location = useLocation();
  const commentRefs = useRef({});
  // Parse query params
  const query = new URLSearchParams(location.search);
  const highlightedCommentId = query.get("comment");
  const highlightedReplyId = query.get("reply");

  useEffect(() => {
    if (highlightedCommentId) {
      // Expand this comment
      setExpanded((prev) => ({
        ...prev,
        [highlightedCommentId]: true,
        [`replies-${highlightedCommentId}`]: true,
      }));

      // Scroll to it after render
      setTimeout(() => {
        const el =
          commentRefs.current[highlightedReplyId || highlightedCommentId];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("highlighted-comment");
          setTimeout(() => el.classList.remove("highlighted-comment"), 2000);
        }
      }, 300);
    }
  }, [highlightedCommentId, highlightedReplyId]);
  const comments = data?.comments || [];

  const isUnchanged =
    editing && !editing.parentId && content.trim() === editing.content?.trim();

  const toggleExpanded = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ---- Handle submit for top-level comments ----
  const handleSubmit = async () => {
    if (!currentUser)
      return handleWarning("Login Required", "Please log in to comment.");

    const trimmed = content.trim();
    if (!editing && !trimmed) {
      setError(true);
      return handleError({ message: "Content cannot be empty." }, "Empty");
    }

    try {
      if (editing && !editing.parentId) {
        await updateComment({
          id: editing._id,
          content: trimmed,
          postId,
        }).unwrap();
        handleSuccess("Comment updated!");
        setEditing(null);
      } else {
        await createComment({ postId, content: trimmed }).unwrap();
        handleSuccess("Comment added!");
      }
      setContent("");
    } catch (err) {
      handleError(err, "Save failed");
    }
  };

  // ---- Handle delete (comment or reply) ----
  const handleDelete = async (id, parentId) => {
    try {
      setDeletingId(id);
      if (parentId) {
        await deleteReply({
          commentId: parentId,
          replyId: id,
          postId,
        }).unwrap();
        handleSuccess("Reply deleted");
      } else {
        await deleteComment({ id, postId }).unwrap();
        handleSuccess("Comment deleted");
      }
    } catch (err) {
      handleError(err, "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // --- handle reply submit/edit
  const handleReplySubmit = async (commentId, replyId = null) => {
    const trimmed = (replyContent[commentId] || "").trim();
    if (!trimmed) return;

    try {
      if (replyId) {
        await updateReply({
          commentId,
          replyId,
          content: trimmed,
          postId,
        }).unwrap();
        handleSuccess("Reply updated!");
      } else {
        await createReply({
          commentId,
          postId,
          content: trimmed,
        }).unwrap();
        handleSuccess("Reply added!");
        setExpanded((prev) => ({ ...prev, [`replies-${commentId}`]: true }));
      }
      setReplyingTo(null);
      setEditing(null);
      setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      handleError(err, "Reply failed");
    }
  };

  // --- Handle toggle like comment
  const handleLikeComment = (comment) => {
    toggleLikeComment({ id: comment._id, postId });
  };

  // --- Handle toggle like reply

  const handleLikeReply = (commentId, reply) => {
    toggleLikeReply({ commentId, replyId: reply._id, postId });
  };
  if (isLoading) return <Spin />;

  return (
    <div>
      <CommentList
        commentRefs={commentRefs}
        comments={comments.slice(0, visibleCount)}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        currentUser={currentUser}
        deletingId={deletingId}
        replyingTo={replyingTo}
        replyContent={replyContent}
        setReplyContent={setReplyContent}
        editing={editing}
        onEdit={(c) => {
          if (c.parentId) {
            // editing a reply
            setEditing(c);
            setReplyingTo(c.parentId);
            setReplyContent((prev) => ({ ...prev, [c.parentId]: c.content }));
          } else {
            // editing a top-level comment
            setEditing(c);
            setContent(c.content);
          }
        }}
        onDelete={handleDelete}
        onReplyClick={(c) => {
          setReplyingTo(c._id);
          setEditing(null);
          setContent("");
        }}
        onReplySubmit={handleReplySubmit}
        onReplyCancel={(id) => {
          setReplyingTo(null);
          setEditing(null);
          setReplyContent((prev) => ({ ...prev, [id]: "" }));
        }}
        content={content}
        setContent={setContent}
        onCommentSubmit={handleSubmit}
        onCommentCancel={() => {
          setEditing(null);
          setContent("");
        }}
        isUpdating={isUpdating}
        isUnchanged={isUnchanged}
        onLikeComment={handleLikeComment}
        onLikeReply={handleLikeReply}
      />{" "}
      {comments.length > visibleCount && (
        <Button
          type="link"
          onClick={() => setVisibleCount((c) => c + 3)}
          style={{ marginTop: 8 }}
        >
          Show more comments
        </Button>
      )}
      {/* bottom box only if not editing top-level */}
      {(!editing || editing.parentId) && (
        <CommentForm
          value={content}
          onChange={setContent}
          onSubmit={handleSubmit}
          loading={isPosting}
          error={error}
        />
      )}
    </div>
  );
}
