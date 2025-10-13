import { Typography, Skeleton, Spin } from "antd";
import { useGetPostsQuery } from "../../redux/post/postApi";
import PostCard from "../../components/post/cards/PostCard";
import Masonry from "react-masonry-css";

const { Title } = Typography;
const breakpointColumns = { default: 3, 1100: 2, 700: 1 };

export default function TrendingPosts() {
  // --- Fetch top trending posts ---
  const { data, isLoading, isFetching } = useGetPostsQuery({
    sort: "trending",
    limit: 8,
  });
  const posts = data?.posts || [];

  // --- Placeholder skeletons for loading state ---
  const skeletonArray = Array.from({ length: 6 });

  return (
    <section
      id="trending-posts"
      style={{ padding: "20px 0", background: "#fff" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}>
        {/* Section heading */}
        <Title level={2} style={{ marginBottom: 24 }}>
          Trending Now
        </Title>

        {/* --- Loading: show skeletons while fetching data --- */}
        {isLoading ? (
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {skeletonArray.map((_, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <Skeleton
                  active
                  paragraph={{ rows: 3 }}
                  style={{
                    borderRadius: 8,
                    padding: 12,
                    background: "#f5f5f5",
                  }}
                />
              </div>
            ))}
          </Masonry>
        ) : posts.length > 0 ? (
          // --- Success: display trending posts in Masonry grid ---
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {posts.map((post) => (
              <div key={post._id} className="fade-slide-in">
                <PostCard post={post} />
              </div>
            ))}
          </Masonry>
        ) : isFetching ? (
          // --- Intermediate fetching (spinner) ---
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          // --- Empty state ---
          <p style={{ textAlign: "center", color: "#777" }}>
            No trending posts yet.
          </p>
        )}
      </div>
    </section>
  );
}
