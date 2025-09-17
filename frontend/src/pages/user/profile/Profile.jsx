import { useParams } from "react-router-dom";
import { Row, Col, Spin, Result } from "antd";
import { motion } from "framer-motion";
import { useGetUserByIdQuery } from "../../../redux/user/userApi";
import { useGetUserFeedQuery } from "../../../redux/post/postApi";
import ProfileInfo from "./ProfileInfo";
import SuggestedCreators from "./SuggestedCreators";
import UserFeed from "./userFeed";
import { useState } from "react";
import { useSelector } from "react-redux";

const mockLikedCreators = [
  { id: "u1", name: "FitGuru", avatar: "https://picsum.photos/100?random=31" },
  {
    id: "u2",
    name: "ArtWizard",
    avatar: "https://picsum.photos/100?random=32",
  },
];

export default function Profile() {
  const { id } = useParams();
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(id);
  const user = userData?.user;
  const { user: currentUser } = useSelector((state) => state.auth);
  const [sortBy] = useState("newest");

  const { data: feedData, isLoading: isLoadingFeed } = useGetUserFeedQuery({
    userId: id,
    sort: sortBy,
  });

  const feed = feedData?.feed || [];

  if (userLoading) {
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
          <div style={{ position: "sticky", top: 20 }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ProfileInfo user={user} />
              <SuggestedCreators creators={mockLikedCreators} />
            </motion.div>
          </div>
        </Col>

        {/* Right column: Unified Feed */}
        <Col xs={24} md={16}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <UserFeed
              feed={feed}
              isLoading={isLoadingFeed}
              currentUserId={currentUser?._id}
              sortBy={sortBy}
            />
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}
