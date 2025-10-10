import { Card, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "../../../utils/momentShort";

import PostActions from "./PostActions";
import PostDropdown from "./PostDropdown";

const { Text, Paragraph } = Typography;

export default function PostCard({
  post,
  isSmall,
  currentUser,
  onEdit,
  onDelete,
  onHide,
}) {
  return (
    <Card
      key={post._id}
      style={{
        breakInside: "avoid", // prevents Masonry layout overlap
        marginBottom: 16,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* ---------- Header (avatar + username + timestamp) ---------- */}
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
            src={post.userId?.avatar || undefined}
            icon={<UserOutlined />}
            onError={(e) => {
              e.currentTarget.src = "";
              return false;
            }}
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

        {/* ---------- Dropdown (Edit/Delete for owner only) ---------- */}
        {currentUser?._id === post.userId?._id && (
          <PostDropdown
            item={post}
            onEdit={onEdit}
            onDelete={onDelete}
            onHide={onHide}
            size="large"
          />
        )}
      </div>
      {post.hidden && currentUser?._id === post.userId?._id && (
        <div
          style={{
            background: "#fffbe6",
            border: "1px solid #ffe58f",
            color: "#ad8b00",
            fontSize: 12,
            fontWeight: 500,
            padding: "2px 6px",
            borderRadius: 6,
            marginBottom: 8,
            display: "inline-block",
          }}
        >
          Hidden (only you can see this)
        </div>
      )}

      {/* ---------- Media (video thumbnail or image) ---------- */}
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
            {/* Video duration overlay */}
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

      {post.images?.length > 0 && (
        <Link to={`/post/${post._id}`}>
          <div
            style={{
              position: "relative",
              marginBottom: 8,
              aspectRatio: "16/9",
              display: "grid",
              gridTemplateColumns: post.images.length === 1 ? "1fr" : "1fr 1fr",
              gap: "2px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {post.images.slice(0, 2).map((img, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  height: "100%",
                  overflow: "hidden",
                  gridColumn: post.images.length === 1 ? "1 / -1" : "auto",
                }}
              >
                <img
                  src={img}
                  alt={`Post attachment ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {/* If this is the last visible image and there are more */}
                {idx === 1 && post.images.length > 2 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#fff",
                      fontSize: 20,
                      fontWeight: 600,
                    }}
                  >
                    +{post.images.length - 2}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Link>
      )}

      {/* ---------- Content ---------- */}
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

      {/* ---------- Footer ---------- */}
      <PostActions post={post} isSmall={isSmall} />
    </Card>
  );
}
