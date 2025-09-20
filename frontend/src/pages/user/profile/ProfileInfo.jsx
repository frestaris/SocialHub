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
        }}
      >
        {isOwner && (
          <Button
            type="text"
            shape="circle"
            icon={<SettingOutlined style={{ fontSize: 18, color: "#555" }} />}
            onClick={() => setIsSettingsModalOpen(true)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
            }}
          />
        )}
        <div style={{ textAlign: "center" }}>
          <Avatar
            src={user.avatar && user.avatar.trim() !== "" ? user.avatar : null}
            icon={
              !user.avatar || user.avatar.trim() === "" ? (
                <UserOutlined />
              ) : null
            }
            size={96}
            style={{ marginBottom: 16 }}
          >
            {!user?.avatar && user?.username?.[0]}
          </Avatar>
          <Title level={3}>{user?.username}</Title>
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
