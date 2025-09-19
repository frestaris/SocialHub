import { useState, useRef } from "react";
import {
  List,
  Avatar,
  Input,
  Button,
  Typography,
  notification,
  Dropdown,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../../redux/comment/commentApi";
import { postApi } from "../../redux/post/postApi";
import { Link } from "react-router-dom";

const { Text } = Typography;

export default function CommentsSection({ postId }) {
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id;
  const [content, setContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const dispatch = useDispatch();
  const [deleteComment] = useDeleteCommentMutation();

  const { data, isLoading } = useGetCommentsByPostQuery(postId);

  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();

  const textareaRef = useRef(null); // 👈 add ref for textarea

  const comments = data?.comments || [];

  // ---- Submit new comment ----
  const handleSubmit = async () => {
    if (!currentUser) {
      notification.warning({
        message: "Login Required",
        description: "Please log in to comment.",
      });
      return;
    }

    if (!content.trim()) {
      notification.error({
        message: "Empty Comment",
        description: "Comment cannot be empty.",
      });
      return;
    }

    try {
      const newComment = await createComment({ postId, content }).unwrap();

      // ✅ Optimistically update post cache
      dispatch(
        postApi.util.updateQueryData("getPostById", postId, (draft) => {
          draft.post.comments.push(newComment.comment);
        })
      );

      notification.success({
        message: "Comment Added",
        description: "Your comment has been posted successfully.",
      });

      setContent("");
    } catch (err) {
      notification.error({
        message: "Comment Failed",
        description:
          err?.data?.error ||
          "Something went wrong while posting your comment.",
      });
      console.error("Failed to add comment:", err);
    }
  };

  // ---- Handle Edit ----
  const handleEdit = (item) => {
    setEditingComment(item);
    setContent(item.content); // load existing text
    // scroll into view after short delay (so state update renders textarea first)
    setTimeout(() => {
      const el = textareaRef.current?.resizableTextArea?.textArea;
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.scrollY + rect.top - 200;
        window.scrollTo({ top: scrollTop, behavior: "smooth" });
        el.focus({ preventScroll: true });
      }
    }, 100);
  };

  const handleUpdate = async () => {
    if (!editingComment) return;

    try {
      await updateComment({
        id: editingComment._id,
        postId,
        content,
      }).unwrap();

      notification.success({
        message: "Comment Updated",
        description: "Your comment has been updated successfully.",
      });

      setEditingComment(null);
      setContent("");
    } catch (err) {
      notification.error({
        message: "Update Failed",
        description:
          err?.data?.error ||
          "Something went wrong while updating your comment.",
      });
    }
  };
  //  ---- Handle Delete ---
  const handleDelete = async (commentId) => {
    try {
      await deleteComment({ id: commentId, postId }).unwrap();
      notification.success({
        message: "Comment Deleted",
        description: "Your comment has been deleted successfully.",
      });
    } catch (err) {
      notification.error({
        message: "Delete Failed",
        description: err?.data?.error || "Failed to delete comment",
      });
    }
  };

  return (
    <div>
      <Input.TextArea
        ref={textareaRef}
        rows={3}
        placeholder={
          editingComment ? "Edit your comment..." : "Add a comment..."
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ marginBottom: "12px" }}
      />
      <Button
        type="primary"
        onClick={editingComment ? handleUpdate : handleSubmit}
        loading={isPosting || isUpdating}
        disabled={
          !currentUser ||
          (!editingComment && !content.trim()) ||
          (editingComment && content.trim() === editingComment.content.trim())
        }
      >
        {editingComment ? "Update Comment" : "Comment"}
      </Button>

      <List
        loading={isLoading}
        itemLayout="horizontal"
        dataSource={comments}
        style={{ marginTop: "16px" }}
        renderItem={(item) => (
          <List.Item
            actions={[
              currentUserId === item.userId?._id && (
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
                  />
                </Dropdown>
              ),
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar src={item.userId?.avatar} icon={<UserOutlined />} />
              }
              title={
                <Link to={`/profile/${item.userId?._id}`}>
                  <Text style={{ color: "#1677ff" }} strong>
                    {item.userId?.username}
                  </Text>{" "}
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {moment(item.createdAt).fromNow()}
                    {item.edited && (
                      <span style={{ marginLeft: 6 }}>(edited)</span>
                    )}
                  </Text>
                </Link>
              }
              description={item.content}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
