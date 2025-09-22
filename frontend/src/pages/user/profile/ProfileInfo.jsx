import { Card, Avatar, Typography, Button, Space } from "antd";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useState, useMemo } from "react";
import SettingsModal from "../settings/SettingsModal";
import Upload from "../../upload/Upload";
import FollowButton from "../../../components/FollowButton";

const { Title, Paragraph } = Typography;

export default function ProfileInfo({ user }) {
  const currentUser = useSelector((state) => state.auth.user);
  const isOwner = currentUser && user && currentUser._id === user._id;

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const isFollowingUser = useMemo(() => {
    if (!currentUser || !user) return false;
    return user.followers?.some((f) => f._id === currentUser._id);
  }, [user, currentUser]);

  return (
    <>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
          padding: 0,
          overflow: "hidden",
        }}
        styles={{
          body: { padding: 0 },
        }}
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
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
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

          {isOwner && (
            <Button
              type="text"
              shape="circle"
              icon={<SettingOutlined style={{ fontSize: 18, color: "#fff" }} />}
              onClick={() => setIsSettingsModalOpen(true)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "rgba(0,0,0,0.4)",
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
          <Paragraph type="secondary">{user?.email}</Paragraph>
          <Paragraph>{user?.bio || ""}</Paragraph>

          <Space direction="vertical" style={{ width: "100%" }}>
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
