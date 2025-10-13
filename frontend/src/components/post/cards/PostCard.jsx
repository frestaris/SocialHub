import { useState } from "react";
import { Card, Avatar, Typography, Skeleton } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "../../../utils/momentShort";

import PostActions from "./PostActions";
import PostDropdown from "./PostDropdown";

const { Text, Paragraph } = Typography;

function PostImage({ src, alt, showOverlay, fitMode = "cover" }) {
  const [loaded, setLoaded] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState(null);

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setNaturalRatio(naturalHeight / naturalWidth);
    }
    setLoaded(true);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        borderRadius: 8,
        background: "#f5f5f5",
      }}
    >
      {/* --- Skeleton while loading --- */}
      {!loaded && (
        <div
          style={{
            width: "100%",
            aspectRatio: naturalRatio ? `1 / ${naturalRatio}` : "16 / 9",
            borderRadius: 8,
            background: "#f0f0f0",
          }}
        >
          <Skeleton.Image
            active
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8,
            }}
          />
        </div>
      )}

      {/* --- Actual image --- */}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        style={{
          width: "100%",
          height: "auto",
          display: loaded ? "block" : "none",
          objectFit: fitMode,
          transition: "opacity 0.3s ease",
          opacity: loaded ? 1 : 0,
        }}
      />

      {/* --- Overlay --- */}
      {showOverlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 0.5,
            textShadow: "0 2px 6px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        >
          {showOverlay}
        </div>
      )}
    </div>
  );
}

function VideoThumbnail({ src, alt, duration }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {!loaded && (
        <Skeleton.Image
          active
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 0,
            position: "absolute",
            top: 0,
            left: 0,
            objectFit: "cover",
          }}
        />
      )}

      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
          display: "block",
        }}
      />

      {duration > 0 && (
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
          {Math.floor(duration / 60)}:
          {(duration % 60).toString().padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

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
            <VideoThumbnail
              src={post.video.thumbnail || "/fallback-thumbnail.jpg"}
              alt={post.video.title}
              duration={post.video.duration}
            />
          </div>
        </Link>
      )}

      {post.images?.length > 0 && (
        <Link to={`/post/${post._id}`}>
          <div
            style={{
              display: "flex",
              flexDirection: post.images.length === 2 ? "row" : "column",
              gap: "6px",
              marginBottom: 8,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {post.images.slice(0, 2).map((img, idx) => (
              <div
                key={idx}
                style={{
                  flex: post.images.length === 2 ? 1 : "none",
                  position: "relative",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <PostImage
                  src={img}
                  alt={`Post image ${idx + 1}`}
                  showOverlay={
                    idx === 1 && post.images.length > 2
                      ? `+${post.images.length - 2}`
                      : null
                  }
                  fitMode={post.images.length === 2 ? "cover" : "contain"}
                />
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
