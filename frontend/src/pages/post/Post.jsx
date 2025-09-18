import { Divider, Spin, Result, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPostByIdQuery } from "../../redux/post/postApi";

import PostInfo from "./PostInfo";
import CommentsSection from "./CommentsSection";

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetPostByIdQuery(id);
  const post = data?.post;

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  if (!post) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="404"
          title="Post Not Found"
          subTitle="Sorry, the post you are looking for does not exist or has been removed."
          extra={
            <Button type="primary" onClick={() => navigate("/")}>
              Back Home
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: post.type === "video" ? "1200px" : "900px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <PostInfo post={post} />

      <Divider />
      <CommentsSection postId={post._id || []} />
    </div>
  );
}
