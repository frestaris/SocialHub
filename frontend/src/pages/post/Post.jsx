import { useEffect } from "react";

// --- Routing ---
import { useParams, useNavigate } from "react-router-dom";

// --- Redux / API ---
import {
  useGetPostByIdQuery,
  useIncrementPostViewsMutation,
} from "../../redux/post/postApi";

// --- Libraries ---
import { Divider, Result, Skeleton } from "antd";

// --- Components ---
import PostInfo from "./PostInfo";
import CommentsSection from "../../components/post/comments/CommentsSection";
import GradientButton from "../../components/common/GradientButton";

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
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
            padding: "20px",
            margin: "20px",
          }}
        >
          {/* --- Image placeholder --- */}
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 8,
              background: "#f0f0f0",
              overflow: "hidden",
              marginBottom: 20,
              position: "relative",
            }}
          >
            <Skeleton.Image
              active
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                borderRadius: 8,
              }}
            />
          </div>

          {/* --- Avatar + username skeleton --- */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <Skeleton.Avatar active size="large" shape="circle" />
            <div style={{ flex: 1 }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 120, marginBottom: 6 }}
              />
            </div>
          </div>

          {/* --- Text/content skeleton --- */}
          <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={false}
            style={{ marginTop: 8 }}
          />
        </div>
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
            <GradientButton text="Back Home" onClick={() => navigate("/")} />
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
