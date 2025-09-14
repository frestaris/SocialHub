import { Card, Avatar, Typography, Button, Space } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useState } from "react";
import SettingsModal from "../settings/SettingsModal";

const { Title, Paragraph } = Typography;

export default function ProfileInfo({ user }) {
  const currentUser = useSelector((state) => state.auth.user);
  const isOwner = currentUser && user && currentUser.email === user.email;

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        {/* Settings Icon */}
        {isOwner && (
          <SettingOutlined
            onClick={() => setIsModalOpen(true)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              fontSize: "18px",
              color: "#555",
              cursor: "pointer",
            }}
          />
        )}

        <div style={{ textAlign: "center" }}>
          <Avatar
            src={user?.avatar || null}
            size={96}
            style={{ marginBottom: 16 }}
          >
            {!user?.avatar && user?.username?.[0]}
          </Avatar>
          <Title level={3}>{user?.username}</Title>
          <Paragraph type="secondary">{user?.email}</Paragraph>
          <Paragraph>{user?.bio || "No bio yet."}</Paragraph>

          <Space direction="vertical" style={{ width: "100%" }}>
            {!isOwner && (
              <Button type="primary" block>
                Follow
              </Button>
            )}
            {isOwner && (
              <Button type="default" block>
                Upload
              </Button>
            )}
          </Space>
        </div>
      </Card>

      <SettingsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
      />
    </>
  );
}
