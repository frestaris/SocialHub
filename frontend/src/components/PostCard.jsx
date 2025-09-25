import { Card, Avatar, Typography, Dropdown, Button } from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "moment";
import PostActions from "./PostActions";

const { Text, Paragraph } = Typography;

export default function PostCard({
  post,
  isSmall,
  currentUser,
  onEdit,
  onDelete,
}) {
  return (
    <Card
      key={post._id}
      style={{
        breakInside: "avoid",
        marginBottom: 16,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
      stylesbody={{ padding: "12px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            size="large"
            src={
              post.userId?.avatar
                ? `${post.userId.avatar}?t=${post.userId._id}`
                : null
            }
            icon={!post.userId?.avatar && <UserOutlined />}
          />
          <div>
            <Text
              strong
              style={{
                display: "block",
                fontSize: isSmall ? 12 : 14,
              }}
            >
              <Link to={`/profile/${post.userId._id}`}>
                {post.userId?.username}
              </Link>
            </Text>
            <Text type="secondary" style={{ fontSize: isSmall ? 10 : 12 }}>
              {moment(post.createdAt).fromNow()}
              {post.edited && <span style={{ marginLeft: 6 }}>(edited)</span>}
            </Text>
          </div>
        </div>

        {currentUser?._id === post.userId?._id && (
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Edit",
                  icon: <EditOutlined />,
                  onClick: () => onEdit(post),
                },
                {
                  key: "delete",
                  label: "Delete",
                  danger: true,
                  icon: <DeleteOutlined />,
                  onClick: () => onDelete(post),
                },
              ],
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="large"
              icon={<MoreOutlined style={{ fontSize: 20 }} />}
              shape="circle"
            />
          </Dropdown>
        )}
      </div>

      {/* Media */}
      {post.type === "video" && post.video && (
        <Link to={`/post/${post._id}`}>
          <div
            style={{
              position: "relative",
              marginBottom: 8,
              aspectRatio: "16/9",
              overflow: "hidden",
              borderRadius: "8px",
            }}
          >
            <img
              src={post.video.thumbnail || "/fallback-thumbnail.jpg"}
              alt={post.video.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {post.video.duration > 0 && (
              <span
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  background: "rgba(0,0,0,0.75)",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {Math.floor(post.video.duration / 60)}:
                {(post.video.duration % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
        </Link>
      )}

      {post.image && (
        <Link to={`/post/${post._id}`}>
          <div
            style={{
              position: "relative",
              marginBottom: 8,
              aspectRatio: "16/9",
              overflow: "hidden",
              borderRadius: "8px",
            }}
          >
            <img
              src={post.image}
              alt="Post attachment"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </Link>
      )}

      {/* Content */}
      {post.type === "video" ? (
        <>
          <Paragraph
            style={{ margin: "0 0 4px", fontSize: isSmall ? 13 : 15 }}
            ellipsis={{ rows: 2 }}
          >
            <Link
              to={`/post/${post._id}`}
              style={{ color: "#000", fontWeight: 600 }}
            >
              {post.video?.title}
            </Link>
          </Paragraph>
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 2 }}
            style={{ margin: 0, fontSize: isSmall ? 13 : 15 }}
          >
            {post.content}
          </Paragraph>
        </>
      ) : (
        <Paragraph
          type="secondary"
          ellipsis={{ rows: 3 }}
          style={{ margin: "4px 0 0" }}
        >
          <Link to={`/post/${post._id}`} style={{ color: "inherit" }}>
            {post.content}
          </Link>
        </Paragraph>
      )}

      {/* Footer */}
      <PostActions post={post} isSmall={isSmall} />
    </Card>
  );
}
