import { Card, Avatar, Typography, Button, Space } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useState } from "react";
import SettingsModal from "../settings/SettingsModal";
import Upload from "../../upload/Upload";

const { Title, Paragraph } = Typography;

export default function ProfileInfo({ user }) {
  const currentUser = useSelector((state) => state.auth.user);
  const isOwner = currentUser && user && currentUser.email === user.email;
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // ✅ separate state

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
            src={user?.avatar || null}
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
              <Button type="primary" block>
                Follow
              </Button>
            )}
            {isOwner && (
              <Button
                type="default"
                block
                onClick={() => setIsUploadModalOpen(true)}
              >
                Upload
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Settings Modal */}
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
      />

      {/* Upload Modal */}
      <Upload
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}
