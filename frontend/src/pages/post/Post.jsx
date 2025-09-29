import { useEffect } from "react";

// --- Routing ---
import { useParams, useNavigate } from "react-router-dom";

// --- Redux / API ---
import {
  useGetPostByIdQuery,
  useIncrementPostViewsMutation,
} from "../../redux/post/postApi";

// --- Libraries ---
import { Divider, Spin, Result, Button } from "antd";

// --- Components ---
import PostInfo from "./PostInfo";
import CommentsSection from "../../components/post/comments/CommentsSection";

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- API calls ---
  const { data, isLoading } = useGetPostByIdQuery(id);
  const [incrementPostViews] = useIncrementPostViewsMutation();

  const post = data?.post;

  // --- Increment views on mount ---
  useEffect(() => {
    if (id) {
      incrementPostViews(id);
    }
  }, [id, incrementPostViews]);

  // --- Loading state ---
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

  // --- Not found state ---
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

  // --- Success state ---
  return (
    <div
      style={{
        maxWidth: post.type === "video" ? "1200px" : "900px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      {/* Post details */}
      <PostInfo post={post} />

      <Divider />

      {/* Comments */}
      <CommentsSection postId={post._id} />
    </div>
  );
}
