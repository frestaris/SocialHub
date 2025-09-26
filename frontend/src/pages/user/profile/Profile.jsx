import { useParams } from "react-router-dom";
import { Row, Col, Spin, Result } from "antd";
import { useGetUserByIdQuery } from "../../../redux/user/userApi";
import { useGetUserFeedQuery } from "../../../redux/post/postApi";
import ProfileInfo from "./ProfileInfo";
import SuggestedCreators from "./SuggestedCreators";
import UserFeed from "./UserFeed";
import { useState } from "react";
import { useSelector } from "react-redux";
import Footer from "../../../components/Footer";

export default function Profile() {
  const { id } = useParams();
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

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#fafafa",
        padding: "24px",
      }}
    >
      <Row gutter={[24, 24]}>
        {/* Left column */}
        <Col xs={24} md={8}>
          <div style={{ position: "sticky", top: 90 }}>
            <div className="fade-slide-in">
              <ProfileInfo user={user} />
              <SuggestedCreators followers={user.followers} />
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
              </div>{" "}
            </div>
          </div>
        </Col>

        {/* Right column */}
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
