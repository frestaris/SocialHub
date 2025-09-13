import {
  Card,
  Avatar,
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Paragraph } = Typography;

export default function ProfileInfo({ user }) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const isOwner = currentUser && user && currentUser.email === user.email;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = () => {
    form.setFieldsValue({
      username: user?.username,
      bio: user?.bio,
      avatar: user?.avatar,
    });
    setIsModalOpen(true);
  };

  const handleSave = (values) => {
    console.log("Updated profile:", values);
    // 🔑 Later: dispatch updateUser action to backend
    setIsModalOpen(false);
  };

  return (
    <>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        {/* Edit Icon (only for owner) */}
        {isOwner && (
          <EditOutlined
            onClick={handleEdit}
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
          <Avatar src={user?.avatar} size={96} style={{ marginBottom: 16 }} />
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
              <Button type="default" block onClick={() => navigate("/upload")}>
                Upload
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Modal for editing profile */}
      <Modal
        title="Edit Profile"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter a username" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Bio" name="bio">
            <Input.TextArea
              rows={3}
              placeholder="Write something about yourself..."
            />
          </Form.Item>

          <Form.Item label="Avatar URL" name="avatar">
            <Input placeholder="Paste avatar image URL" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Save Changes
          </Button>
        </Form>
      </Modal>
    </>
  );
}
