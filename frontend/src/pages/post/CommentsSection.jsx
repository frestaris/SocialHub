import { useState } from "react";
import { List, Avatar, Input, Button, Typography, notification } from "antd";
import { UserOutlined } from "@ant-design/icons";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
} from "../../redux/comment/commentApi";
import { postApi } from "../../redux/post/postApi";
import { useDispatch } from "react-redux";

const { Text } = Typography;

export default function CommentsSection({ postId }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [content, setContent] = useState("");
  const dispatch = useDispatch();

  const { data, isLoading } = useGetCommentsByPostQuery(postId);

  const [createComment, { isLoading: isPosting }] = useCreateCommentMutation();

  const comments = data?.comments || [];

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

    // Optimistic UI update rollback backup
    let rolledBack = false;

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
      rolledBack = true;

      notification.error({
        message: "Comment Failed",
        description:
          err?.data?.error ||
          "Something went wrong while posting your comment.",
      });

      console.error("Failed to add comment:", err);
    } finally {
      if (rolledBack) {
        // Optionally: refetch post to ensure data consistency
        dispatch(postApi.util.invalidateTags([{ type: "Post", id: postId }]));
      }
    }
  };

  return (
    <div>
      <Input.TextArea
        rows={3}
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ marginBottom: "12px" }}
      />
      <Button
        type="primary"
        onClick={handleSubmit}
        loading={isPosting}
        disabled={!currentUser}
      >
        Comment
      </Button>

      <List
        loading={isLoading}
        itemLayout="horizontal"
        dataSource={comments}
        style={{ marginTop: "16px" }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar src={item.userId?.avatar} icon={<UserOutlined />} />
              }
              title={
                <Text strong>
                  {item.userId?.username}{" "}
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {moment(item.createdAt).fromNow()}
                  </Text>
                </Text>
              }
              description={item.content}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
