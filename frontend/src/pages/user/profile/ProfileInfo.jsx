import { useState, useMemo, useRef } from "react";

// --- Ant Design ---
import { Card, Avatar, Typography, Button, Space } from "antd";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";

// --- Redux ---
import { useSelector } from "react-redux";

// --- Components ---
import SettingsModal from "../settings/SettingsModal";
import Upload from "../../../components/post/Upload";
import FollowButton from "../../../components/FollowButton";

const { Title, Paragraph, Text } = Typography;

export default function ProfileInfo({ user }) {
  // --- Redux state ---
  const currentUser = useSelector((state) => state.auth.user);
  const isOwner = currentUser && user && currentUser._id === user._id;

  // --- Local state ---
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [hover, setHover] = useState(false);

  // --- Bio expand/collapse ---
  const [expanded, setExpanded] = useState(false);
  const bioRef = useRef(null);

  const isFollowingUser = useMemo(() => {
    if (!currentUser || !user) return false;
    return user.followers?.some((f) => f._id === currentUser._id);
  }, [user, currentUser]);

  const bio = user?.bio || "";

  return (
    <>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
          padding: 0,
          height: 400,
          overflowY: "auto",
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Cover image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 100,
            background: "#f0f0f0",
          }}
        >
          {user?.cover && user.cover.trim() !== "" ? (
            <img
              src={user.cover}
              alt="Cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #1677ff 0%, #52c41a 100%)",
              }}
            />
          )}

          {/* Settings button (owner only) */}
          {isOwner && (
            <Button
              type="text"
              shape="circle"
              icon={<SettingOutlined style={{ fontSize: 20, color: "#fff" }} />}
              onClick={() => setIsSettingsModalOpen(true)}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: hover ? "rgba(255,255,255,0.15)" : "transparent",
                transition: "background 0.2s ease",
              }}
            />
          )}
        </div>

        {/* Avatar + user info */}
        <div
          style={{
            textAlign: "center",
            marginTop: -48,
            padding: "0 16px 16px",
          }}
        >
          <Avatar
            src={user.avatar && user.avatar.trim() !== "" ? user.avatar : null}
            icon={
              !user.avatar || user.avatar.trim() === "" ? (
                <UserOutlined />
              ) : null
            }
            size={96}
            style={{
              border: "3px solid #fff",
              background: "#cecece",
            }}
          >
            {!user?.avatar && user?.username?.[0]}
          </Avatar>

          <Title level={3} style={{ marginTop: 8 }}>
            {user?.username}
          </Title>
          <Text type="secondary">{user?.email}</Text>

          {/* --- Bio with expand/collapse --- */}
          {bio && (
            <div style={{ marginTop: 24, textAlign: "left" }}>
              <div
                ref={bioRef}
                style={{
                  maxHeight: expanded ? bioRef.current?.scrollHeight : 60,
                  overflow: "hidden",
                  transition: "max-height 0.5s ease",
                }}
              >
                <Paragraph
                  style={{
                    whiteSpace: "pre-line",
                  }}
                >
                  {bio}
                </Paragraph>
              </div>

              {bio.length > 120 && (
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0 }}
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  {expanded ? "Show Less" : "Show More"}
                </Button>
              )}
            </div>
          )}

          <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
            {!isOwner && (
              <FollowButton
                userId={user._id}
                isFollowing={isFollowingUser}
                isOwner={isOwner}
                block
              />
            )}
            {isOwner && (
              <Button
                type="primary"
                block
                onClick={() => setIsUploadModalOpen(true)}
              >
                Post
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Modals */}
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
      />
      <Upload
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}
