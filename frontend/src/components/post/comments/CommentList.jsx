import { List, Button } from "antd";
import CommentItem from "./CommentItem";
import ReplyForm from "./ReplyForm";
import CommentForm from "./CommentForm";

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
          />

          {/* ✅ Inline edit form for this top-level comment */}
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

          {/* Reply form for new reply */}
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

          {/* Replies toggle */}
          {item.replies?.length > 0 && (
            <div
              style={{
                paddingLeft: 28,
                marginTop: 4,
                borderLeft: "2px solid #e5e5e5",
              }}
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
                    <div key={reply._id} style={{ marginBottom: 8 }}>
                      {/* Each reply */}
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
