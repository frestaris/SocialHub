import { List, Button } from "antd";
import CommentItem from "./CommentItem";
import ReplyForm from "./ReplyForm";
import CommentForm from "./CommentForm";
import "./CommentList.css";

/**
 *
 * ------------------------------------------------------------------
 * This component renders a full threaded comment section for a post.
 * It handles displaying all comments and their replies, inline editing,
 * reply creation, deletion, and "show more" toggling — all in one place.
 *
 * How it works:
 * - Loops through each top-level comment and renders it with <CommentItem />
 * - For each comment:
 *    • If editing, show an inline <CommentForm />
 *    • If replying, show an inline <ReplyForm />
 *    • If it has replies, show them nested under a collapsible container
 *      with CSS "elbow" lines connecting avatars (see CommentList.css)
 *
 * Why it looks busy:
 *   Comment threads require a lot of state coordination between editing,
 *   replying, liking, and expanding. This file doesn’t contain logic for
 *   CRUD operations — only UI wiring. Actual data mutations happen in
 *   CommentsSection.jsx via RTK Query.
 *
 * Key props (simplified mental map):
 *   comments ........ the full list of top-level comments
 *   expanded ........ which comment IDs are expanded (for replies/content)
 *   toggleExpanded ... toggles open/close for a given comment ID
 *   currentUser ...... needed for ownership and like logic
 *
 *   editing .......... the comment/reply currently being edited
 *   replyingTo ....... ID of comment currently being replied to
 *   content .......... text of a comment being edited/created
 *   replyContent ..... { commentId: replyText } map for replies
 *
 *   onEdit, onDelete ........ actions for modifying comments/replies
 *   onReplyClick ............ open reply input under a comment
 *   onReplySubmit ........... handle creating or editing replies
 *   onReplyCancel ........... close reply input and clear text
 *   onCommentSubmit ......... handle creating or editing comments
 *   onCommentCancel ......... cancel editing a comment
 *   onLikeComment/onLikeReply toggle like states
 *
 *   commentRefs ...... ref map for scroll/highlight behavior
 *   deletingId ....... marks which comment/reply is currently deleting
 *
 * Styling:
 *   Thread connections and highlight effects are handled in CommentList.css
 *
 * TL;DR:
 *   This component focuses on presentation and interaction wiring for
 *   threaded comments. The heavy lifting (API calls, mutation state)
 *   happens one level up in CommentsSection.jsx.
 */

export default function CommentList({
  comments,
  expanded,
  toggleExpanded,
  currentUser,
  onEdit,
  onDelete,
  onReplyClick,
  onReplySubmit,
  onReplyCancel,
  deletingId,
  replyingTo,
  replyContent,
  setReplyContent,
  editing,
  content,
  setContent,
  onCommentSubmit,
  onCommentCancel,
  isUpdating,
  isUnchanged,
  onLikeComment,
  onLikeReply,
  commentRefs,
}) {
  return (
    <List
      dataSource={comments}
      renderItem={(item) => (
        <div
          key={item._id}
          ref={(el) => (commentRefs.current[item._id] = el)}
          style={{ marginBottom: 12 }}
        >
          <CommentItem
            item={item}
            currentUser={currentUser}
            isOwner={Boolean(
              currentUser && item.userId && currentUser._id === item.userId._id
            )}
            expanded={expanded[item._id]}
            onToggleExpanded={() => toggleExpanded(item._id)}
            onEdit={onEdit}
            onDelete={(id) => onDelete(id, null)}
            onReplyClick={onReplyClick}
            deleting={deletingId === item._id}
            allowReply
            onLikeComment={onLikeComment}
            onLikeReply={onLikeReply}
          />

          {/* ✅ Inline edit form */}
          {editing && editing._id === item._id && !editing.parentId && (
            <CommentForm
              value={content}
              onChange={setContent}
              onSubmit={onCommentSubmit}
              onCancel={onCommentCancel}
              loading={isUpdating}
              editing
              isUnchanged={isUnchanged}
            />
          )}

          {/* Reply form */}
          {replyingTo === item._id && !editing?.parentId && (
            <ReplyForm
              value={replyContent[item._id] || ""}
              onChange={(val) =>
                setReplyContent((prev) => ({ ...prev, [item._id]: val }))
              }
              onCancel={() => onReplyCancel(item._id)}
              onSubmit={() => onReplySubmit(item._id)}
            />
          )}

          {/* Replies block with custom thread line */}
          {item.replies?.length > 0 && (
            <div
              className={`comment-replies ${
                expanded[`replies-${item._id}`] ? "expanded" : "collapsed"
              }`}
            >
              {!expanded[`replies-${item._id}`] ? (
                <Button
                  type="link"
                  size="small"
                  onClick={() => toggleExpanded(`replies-${item._id}`)}
                >
                  Show {item.replies.length}{" "}
                  {item.replies.length === 1 ? "reply" : "replies"}
                </Button>
              ) : (
                <>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => toggleExpanded(`replies-${item._id}`)}
                  >
                    Hide replies
                  </Button>

                  {[...item.replies].reverse().map((reply) => (
                    <div
                      key={reply._id}
                      ref={(el) => (commentRefs.current[reply._id] = el)}
                      className="reply-wrapper"
                    >
                      {/* REPLY COMPONENT */}
                      <CommentItem
                        item={reply}
                        currentUser={currentUser}
                        isOwner={Boolean(
                          currentUser &&
                            reply.userId &&
                            currentUser._id === reply.userId._id
                        )}
                        expanded={expanded[reply._id]}
                        onToggleExpanded={() => toggleExpanded(reply._id)}
                        onEdit={(r) => onEdit({ ...r, parentId: item._id })}
                        onDelete={(id) => onDelete(id, item._id)}
                        deleting={deletingId === reply._id}
                        allowReply={false}
                        isReply
                        onLikeComment={onLikeComment}
                        onLikeReply={onLikeReply}
                        parentId={item._id}
                      />

                      {/* Reply form for editing THIS reply */}
                      {editing?.parentId === item._id &&
                        editing?._id === reply._id &&
                        (() => {
                          const currentValue = replyContent[item._id] || "";
                          const original = reply.content || "";
                          const unchanged =
                            currentValue.trim() === original.trim();

                          return (
                            <ReplyForm
                              value={currentValue}
                              onChange={(val) =>
                                setReplyContent((prev) => ({
                                  ...prev,
                                  [item._id]: val,
                                }))
                              }
                              onCancel={() => onReplyCancel(item._id)}
                              onSubmit={() =>
                                onReplySubmit(item._id, editing._id)
                              }
                              editing
                              isUnchanged={unchanged}
                            />
                          );
                        })()}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    />
  );
}
