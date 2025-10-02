import { List, Button } from "antd";
import CommentItem from "./CommentItem";
import ReplyForm from "./ReplyForm";
import CommentForm from "./CommentForm";
import "./CommentList.css";

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
}) {
  return (
    <List
      dataSource={comments}
      renderItem={(item) => (
        <div key={item._id} style={{ marginBottom: 12 }}>
          <CommentItem
            item={item}
            currentUser={currentUser}
            isOwner={currentUser?._id === item.userId?._id}
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
                    <div key={reply._id} className="reply-wrapper">
                      {/* REPLY COMPONENT */}
                      <CommentItem
                        item={reply}
                        currentUser={currentUser}
                        isOwner={currentUser?._id === reply.userId?._id}
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
                        editing?._id === reply._id && (
                          <ReplyForm
                            value={replyContent[item._id] || ""}
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
                          />
                        )}
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
