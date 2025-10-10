import { Typography, Row, Col, Skeleton } from "antd";
import { useGetPostsQuery } from "../../redux/post/postApi";
import PostCard from "../../components/post/cards/PostCard";

const { Title } = Typography;

export default function TrendingPosts() {
  const { data, isLoading } = useGetPostsQuery({ sort: "trending", limit: 4 });
  const posts = data?.posts || [];

  return (
    <section
      id="trending-posts"
      style={{ padding: "20px", background: "#fff" }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Title level={2}>Trending Now</Title>
        <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <Col xs={24} sm={12} md={12} key={i}>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Col>
              ))
            : posts.map((post) => (
                <Col xs={24} sm={12} md={12} key={post._id}>
                  <PostCard post={post} />
                </Col>
              ))}
        </Row>
      </div>
    </section>
  );
}
