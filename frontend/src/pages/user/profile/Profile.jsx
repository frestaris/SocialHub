import { useParams } from "react-router-dom";
import { Row, Col, Tabs, Spin } from "antd";
import { motion } from "framer-motion";
import { useGetUserByIdQuery } from "../../../redux/user/userApi";
import { useGetVideosByUserQuery } from "../../../redux/video/videoApi";

import ProfileInfo from "./ProfileInfo";
import SuggestedCreators from "./SuggestedCreators";
import FeaturedVideo from "./FeaturedVideo";
import VideoList from "./VideoList";
import PostFeed from "./PostFeed";
import { useState } from "react";

const mockPosts = [
  {
    id: 101,
    author: "CreatorXYZ",
    content: "Excited to announce my next livestream tomorrow! 🎉",
    createdAt: "2025-08-12",
  },
  {
    id: 102,
    author: "CreatorXYZ",
    content: "Thanks everyone for 1k followers ❤️",
    createdAt: "2025-08-08",
  },
];

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
  const { data: userData } = useGetUserByIdQuery(id);
  const user = userData?.user;

  const [sortBy, setSortBy] = useState("popularity");

  const { data: videoData, isLoading } = useGetVideosByUserQuery({
    userId: id,
    sort: sortBy,
  });

  const videos = videoData?.videos || [];

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#fafafa",
        padding: "24px",
      }}
    >
      <Row gutter={[24, 24]}>
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

        <Col xs={24} md={16}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Tabs
              defaultActiveKey="videos"
              items={[
                {
                  key: "videos",
                  label: "Videos",
                  children: isLoading ? (
                    <div
                      style={{
                        minHeight: "300px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Spin size="large"></Spin>
                    </div>
                  ) : (
                    <>
                      {videos[0] && <FeaturedVideo video={videos[0]} />}
                      <VideoList
                        videos={videos}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                      />
                    </>
                  ),
                },
                {
                  key: "posts",
                  label: "Posts",
                  children: <PostFeed posts={mockPosts} />,
                },
              ]}
            />
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}
