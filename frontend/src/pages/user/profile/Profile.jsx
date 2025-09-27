import { useState } from "react";

// --- React Router ---
import { useParams } from "react-router-dom";

// --- Ant Design ---
import { Row, Col, Spin, Result } from "antd";

// --- Redux ---
import { useSelector } from "react-redux";
import { useGetUserByIdQuery } from "../../../redux/user/userApi";
import { useGetUserFeedQuery } from "../../../redux/post/postApi";

// --- Components ---
import ProfileInfo from "./ProfileInfo";
import UserFollowers from "./UserFollowers";
import UserFeed from "./UserFeed";
import Footer from "../../../components/Footer";

export default function Profile() {
  // --- Routing ---
  const { id } = useParams();

  // --- Queries ---
  const {
    data: userData,
    isLoading: userLoading,
    isFetching,
  } = useGetUserByIdQuery(id);
  const user = userData?.user;

  const { user: currentUser } = useSelector((state) => state.auth);

  const [sortBy] = useState("newest");

  const { data: feedData, isLoading: isLoadingFeed } = useGetUserFeedQuery({
    userId: id,
    sort: sortBy,
  });
  const feed = feedData?.feed || [];

  // --- Loading state (user info) ---
  if (userLoading || isFetching) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // --- Error/empty user state ---
  if (!user) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
        }}
      >
        <Result
          status="404"
          title="User Not Found"
          subTitle="Sorry, we couldn’t find the profile you’re looking for."
        />
      </div>
    );
  }

  // --- Render ---
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#fafafa",
        padding: "24px",
      }}
    >
      <Row gutter={[24, 24]}>
        {/* Left column (sidebar) */}
        <Col xs={24} md={8}>
          <div style={{ position: "sticky", top: 90 }}>
            <div className="fade-slide-in">
              <ProfileInfo user={user} />
              <UserFollowers followers={user.followers} />

              {/* Footer card */}
              <div
                style={{
                  marginTop: 16,
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                }}
              >
                <Footer />
              </div>
            </div>
          </div>
        </Col>

        {/* Right column (feed) */}
        <Col xs={24} md={16}>
          <div className="fade-slide-in">
            <UserFeed
              feed={feed}
              isLoading={isLoadingFeed}
              currentUserId={currentUser?._id}
              sortBy={sortBy}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}
