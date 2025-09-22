import {
  Card,
  Avatar,
  Space,
  Tooltip,
  Badge,
  Typography,
  Modal,
  List,
} from "antd";
import { Link } from "react-router-dom";
import { UserOutlined, EllipsisOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Text } = Typography;

export default function SuggestedCreators({ followers }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const visibleFollowers = followers?.slice(0, 4) || [];
  const extraCount = followers?.length > 4 ? followers.length - 4 : 0;

  return (
    <>
      <Card
        style={{
          marginTop: 24,
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
        title={
          <Space>
            <Text strong style={{ fontSize: "18px" }}>
              Followers
            </Text>
            <Badge
              count={followers?.length || 0}
              overflowCount={99}
              style={{ backgroundColor: "#1677ff" }}
            />
          </Space>
        }
      >
        <Space wrap>
          {visibleFollowers.length > 0 ? (
            visibleFollowers.map((f) => (
              <Tooltip title={f.username} key={f._id}>
                <Link to={`/profile/${f._id}`}>
                  <Avatar
                    src={f.avatar || null}
                    icon={!f.avatar && <UserOutlined />}
                  />
                </Link>
              </Tooltip>
            ))
          ) : (
            <p>No followers yet</p>
          )}

          {/* Ellipsis for more */}
          {extraCount > 0 && (
            <Tooltip title={`+${extraCount} more`}>
              <Avatar
                style={{
                  backgroundColor: "#f0f0f0",
                  color: "#555",
                  cursor: "pointer",
                }}
                icon={<EllipsisOutlined />}
                onClick={handleOpenModal}
              />
            </Tooltip>
          )}
        </Space>
      </Card>

      {/* Modal with scrollable follower list */}
      <Modal
        title="All Followers"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={400}
        styles={{
          body: {
            maxHeight: "60vh",
            overflowY: "auto",
            padding: "0 16px",
          },
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={followers}
          renderItem={(f) => (
            <List.Item key={f._id}>
              <List.Item.Meta
                avatar={
                  <Link to={`/profile/${f._id}`} onClick={handleCloseModal}>
                    <Avatar
                      src={f.avatar || null}
                      icon={!f.avatar && <UserOutlined />}
                    />
                  </Link>
                }
                title={
                  <Link
                    to={`/profile/${f._id}`}
                    onClick={handleCloseModal}
                    style={{ color: "#1677ff" }}
                  >
                    {f.username}
                  </Link>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
}
