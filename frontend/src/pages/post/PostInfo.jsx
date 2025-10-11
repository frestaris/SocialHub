import { useState, useMemo, useRef, useEffect } from "react";

// --- Libraries ---
import { Typography, Avatar, Button, Grid, Modal } from "antd";
import { UserOutlined } from "@ant-design/icons";

// --- Utils ---
import moment from "../../utils/momentShort";

// --- Routing ---
import { Link } from "react-router-dom";

// --- Redux ---
import { useSelector } from "react-redux";

// --- Components ---
import VideoPlayer from "./VideoPlayer";
import FollowButton from "../../components/common/FollowButton";
import PostActions from "../../components/post/cards/PostActions";

const { Text, Paragraph, Title } = Typography;
const { useBreakpoint } = Grid;
import ArrowButton from "../../components/common/ArrowButton";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

export default function PostInfo({ post }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        const el = contentRef.current;
        const lineHeight = parseInt(window.getComputedStyle(el).lineHeight, 10);
        const maxHeight = lineHeight * 3; // limit to 3 lines
        setIsOverflowing(el.scrollHeight > maxHeight);
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [post.content]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const screens = useBreakpoint();
  const isSmall = !screens.sm; // <768px

  // --- Redux state ---
  const currentUser = useSelector((state) => state.auth.user);
  const isOwner =
    currentUser && post.userId && currentUser._id === post.userId._id;

  // --- Derived state: following ---
  const isFollowingUser = useMemo(() => {
    if (!currentUser || !post?.userId) return false;
    return currentUser.following?.some((f) => f._id === post.userId._id);
  }, [currentUser, post]);

  const openGallery = (idx) => {
    setCurrentIndex(idx);
    setGalleryOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % post.images.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + post.images.length) % post.images.length
    );
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Media (video or images) */}
      {post.type === "video" && post.video?.url && (
        <VideoPlayer src={post.video.url} title={post.video?.title} />
      )}

      {post.images?.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            marginBottom: "16px",

            display: "grid",
            gap: "4px",
            gridTemplateColumns: isSmall
              ? "1fr"
              : post.images.length === 1
              ? "1fr"
              : post.images.length === 2
              ? "1fr 1fr"
              : post.images.length === 3
              ? "1fr 1fr"
              : "1fr 1fr",
            gridTemplateRows:
              !isSmall && post.images.length === 3 ? "auto auto" : "auto",
          }}
        >
          {post.images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                gridColumn:
                  !isSmall && post.images.length === 3 && idx === 2
                    ? "span 2"
                    : "auto", // last image spans full width if 3
              }}
            >
              <img
                src={img}
                alt={`Post attachment ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                  cursor: "pointer",
                  maxHeight: isSmall
                    ? "240px"
                    : post.images.length === 1
                    ? "400px"
                    : post.images.length === 2
                    ? "300px"
                    : "200px",
                }}
                onClick={() => openGallery(idx)}
              />
              {idx === 3 && post.images.length > 4 && (
                <div
                  onClick={() => openGallery(idx)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  +{post.images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Gallery Modal */}
      {galleryOpen && (
        <Modal
          open={galleryOpen}
          onCancel={() => setGalleryOpen(false)}
          footer={null}
          centered
          width="80%"
          styles={{ textAlign: "center", padding: 0 }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={post.images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              style={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />

            {/* Prev arrow only if not first */}
            {currentIndex > 0 && (
              <ArrowButton
                icon={<LeftOutlined style={{ fontSize: 20 }} />}
                onClick={prevImage}
                position="left"
              />
            )}

            {currentIndex < post.images.length - 1 && (
              <ArrowButton
                icon={<RightOutlined style={{ fontSize: 20 }} />}
                onClick={nextImage}
                position="right"
              />
            )}

            {/* Counter in center bottom */}
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {currentIndex + 1} / {post.images.length}
            </div>
          </div>
        </Modal>
      )}

      {/* User header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Avatar */}
          <Link to={`/profile/${post.userId._id}`}>
            <Avatar
              src={post.userId?.avatar || null}
              size="large"
              icon={!post.userId?.avatar && <UserOutlined />}
            />
          </Link>

          {/* Username + timestamp */}
          <div>
            <Link
              to={`/profile/${post.userId?._id}`}
              style={{
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              <Text style={{ color: "#1677ff" }} strong>
                {post.userId?.username}
              </Text>
            </Link>
            <br />
            <Text type="secondary">
              {moment(post.createdAt).fromNow()}
              {post.edited && <span style={{ marginLeft: 6 }}>(edited)</span>}
            </Text>
          </div>
        </div>

        {/* Follow button (hidden for owner) */}
        {!isOwner && (
          <FollowButton
            userId={post.userId._id}
            isFollowing={isFollowingUser}
            isOwner={isOwner}
            size="small"
          />
        )}
      </div>

      {/* Title (only for video posts) */}
      {post.type === "video" && (
        <Title level={3} style={{ marginBottom: "10px" }}>
          {post.video?.title}
        </Title>
      )}

      {/* Content/Description */}
      {post.content && (
        <div
          style={{
            marginTop: "16px",
            background: "#e8f0fe",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              transition: "max-height 0.4s ease",
              maxHeight: expanded
                ? `${contentRef.current?.scrollHeight || 500}px`
                : "4.8em", // ≈ 3 lines * 1.6 line-height
            }}
          >
            <p
              ref={contentRef}
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: "1.6em",
                whiteSpace: "pre-line",
                wordBreak: "break-word",
                overflow: "hidden",
              }}
            >
              {post.content}
            </p>
          </div>

          {/* Show More/Less toggle */}
          {isOverflowing && (
            <Button
              type="link"
              style={{
                padding: 0,
                fontSize: 12,
                transition: "color 0.2s ease",
              }}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show Less" : "Show More"}
            </Button>
          )}
        </div>
      )}

      {/* Post actions (likes, comments, share) */}
      <PostActions post={post} isSmall={false} showCommentsSection={false} />
    </div>
  );
}
