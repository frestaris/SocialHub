import { useParams } from "react-router-dom";
import { Row, Col, Tabs } from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import { useGetUserByIdQuery } from "../../redux/user/userApi";

import ProfileInfo from "./ProfileInfo";
import SuggestedCreators from "./SuggestedCreators";
import FeaturedVideo from "./FeaturedVideo";
import VideoList from "./VideoList";
import PostFeed from "./PostFeed";

const mockVideos = [
  {
    id: 1,
    title: "My First Stream",
    thumbnail: "https://picsum.photos/600/300?random=20",
    views: 1500,
    duration: 360,
    likes: ["u1", "u2"],
    comments: ["c1", "c2", "c3"],
    date: "2025-08-01",
  },
  {
    id: 2,
    title: "Speedrun Highlights",
    thumbnail: "https://picsum.photos/600/300?random=21",
    views: 3200,
    duration: 480,
    likes: ["u1"],
    comments: ["c1"],
    date: "2025-08-05",
  },
  {
    id: 3,
    title: "Fan Q&A",
    thumbnail: "https://picsum.photos/600/300?random=22",
    views: 900,
    duration: 300,
    likes: [],
    comments: ["c1", "c2"],
    date: "2025-08-10",
  },
];

// Mock posts
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
  const { data } = useGetUserByIdQuery(id);
  const user = data?.user;

  const [sortBy, setSortBy] = useState("popularity");

  const sortedVideos = [...mockVideos].sort((a, b) => {
    if (sortBy === "popularity") return b.views - a.views;
    if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#fafafa",
        padding: "24px",
      }}
    >
      <Row gutter={[24, 24]}>
        {/* LEFT: Sticky Profile Info */}
        <Col xs={24} md={8}>
          <div
            style={{
              position: "sticky",
              top: 20, // adjust for navbar height
            }}
          >
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

        {/* RIGHT: Content with Tabs */}
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
                  children: (
                    <>
                      <FeaturedVideo video={sortedVideos[0]} />
                      <VideoList
                        videos={sortedVideos}
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
