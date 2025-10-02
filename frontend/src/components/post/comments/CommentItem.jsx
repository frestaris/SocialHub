import { Avatar, Button, List, Typography } from "antd";
import { UserOutlined, LikeOutlined, LikeFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "../../../utils/momentShort";
import PostDropdown from "../../../components/post/PostDropdown";

const { Paragraph, Text } = Typography;

export default function CommentItem({
  item,
  isOwner,
  currentUser,
  expanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  onReplyClick,
  onLikeComment,
  onLikeReply,
  deleting,
  children,
  allowReply,
  isReply = false,
  parentId,
}) {
  // Check if user already liked this comment/reply
  const hasLiked =
    currentUser &&
    item.likes?.some(
      (u) => u.toString?.() === currentUser._id || u._id === currentUser._id
    );

  const handleLikeToggle = () => {
    if (isReply) {
      onLikeReply?.(parentId, item);
    } else {
      onLikeComment?.(item);
    }
  };

  return (
    <List.Item
      style={{
        paddingLeft: isReply ? 8 : 0,
        borderBottom: "none",
      }}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            src={item.userId?.avatar || undefined}
            icon={<UserOutlined />}
            size={isReply ? 28 : 32}
          />
        }
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Link to={`/profile/${item.userId?._id}`}>
                <Text
                  strong
                  style={{
                    color: "#1677ff",
                    fontSize: isReply ? 13 : 14,
                  }}
                >
                  {item.userId?.username}
                </Text>
              </Link>
              <Text
                type="secondary"
                style={{
                  fontSize: isReply ? 11 : 12,
                  whiteSpace: "nowrap",
                }}
              >
                {moment(item.createdAt).fromNow()}
                {item.edited && <span style={{ marginLeft: 6 }}>(edited)</span>}
              </Text>
            </div>

            {isOwner && (
              <PostDropdown
                item={item}
                onEdit={() => onEdit?.(item)}
                onDelete={() => onDelete(item._id)}
                size="small"
                loading={deleting}
                showHideOption={false}
              />
            )}
          </div>
        }
        description={
          <>
            <div
              style={{
                maxHeight: expanded ? "500px" : "40px",
                overflow: "hidden",
                transition: "max-height 0.5s ease",
              }}
            >
              <Paragraph
                type="secondary"
                style={{
                  marginBottom: 0,
                  fontSize: isReply ? 13 : 14,
                  lineHeight: isReply ? "18px" : "20px",
                }}
              >
                {item.content}
              </Paragraph>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 4,
              }}
            >
              {/* Show more/less */}
              {item.content?.length > 120 && (
                <Button
                  type="link"
                  style={{ padding: 0, fontSize: isReply ? 11 : 12 }}
                  onClick={onToggleExpanded}
                >
                  {expanded ? "Show Less" : "Show More"}
                </Button>
              )}

              {/* Reply button (only for top-level comments) */}
              {currentUser && allowReply && !isReply && (
                <a
                  style={{
                    fontSize: 12,
                    display: "inline-block",
                    cursor: "pointer",
                  }}
                  onClick={() => onReplyClick?.(item)}
                >
                  Reply
                </a>
              )}

              {/* Like button for comments & replies */}
              {currentUser && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    color: hasLiked ? "#1677ff" : "#555",
                    fontWeight: hasLiked ? 600 : 400,
                  }}
                  onClick={handleLikeToggle}
                >
                  {hasLiked ? <LikeFilled /> : <LikeOutlined />}
                  <span>{item.likesCount || 0}</span>
                </div>
              )}
            </div>

            {children}
          </>
        }
      />
    </List.Item>
  );
}
