import { Avatar, Button, List, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
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
  deleting,
  children,
  allowReply,
  isReply = false,
}) {
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
                    fontSize: isReply ? 13 : 14, // 👈 shrink name
                  }}
                >
                  {item.userId?.username}
                </Text>
              </Link>
              <Text
                type="secondary"
                style={{
                  fontSize: isReply ? 11 : 12, // 👈 shrink timestamp
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
                  fontSize: isReply ? 13 : 14, // 👈 shrink body text
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
              {item.content?.length > 120 && (
                <Button
                  type="link"
                  style={{ padding: 0, fontSize: isReply ? 11 : 12 }}
                  onClick={onToggleExpanded}
                >
                  {expanded ? "Show Less" : "Show More"}
                </Button>
              )}

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
            </div>

            {children}
          </>
        }
      />
    </List.Item>
  );
}
