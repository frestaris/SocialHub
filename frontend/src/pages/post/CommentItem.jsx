import { Avatar, Button, List, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import moment from "moment";
import PostDropdown from "../../components/post/PostDropdown";

const { Paragraph, Text } = Typography;

/**
 * CommentItem
 * - Renders a single comment row
 * - Handles:
 *   • Avatar + username + timestamp
 *   • Expand/collapse long text
 *   • Owner dropdown for edit/delete
 */
export default function CommentItem({
  item,
  isOwner,
  expanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <List.Item>
      <List.Item.Meta
        avatar={
          <Avatar
            src={item.userId?.avatar || undefined}
            icon={<UserOutlined />}
          />
        }
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
              }}
            >
              <Link
                to={`/profile/${item.userId?._id}`}
                style={{
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                <Text style={{ color: "#1677ff" }} strong>
                  {item.userId?.username}
                </Text>
              </Link>
              <Text
                type="secondary"
                style={{ fontSize: 12, whiteSpace: "nowrap" }}
              >
                {moment(item.createdAt).fromNow()}
                {item.edited && <span style={{ marginLeft: 6 }}>(edited)</span>}
              </Text>
            </div>

            {isOwner && (
              <PostDropdown
                item={item}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item._id)}
                size="small"
                loading={deleting}
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
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {item.content}
              </Paragraph>
            </div>

            {item.content.length > 120 && (
              <Button
                type="link"
                style={{ padding: 0, fontSize: 12 }}
                onClick={onToggleExpanded}
              >
                {expanded ? "Show Less" : "Show More"}
              </Button>
            )}
          </>
        }
      />
    </List.Item>
  );
}
