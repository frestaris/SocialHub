// --- Ant Design ---
import { Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

/**
 *
 * --------------------------------------
 * Provides menu items (Edit / Delete) for message dropdown.
 *
 * Responsibilities:
 *  Disables edit option if the time window expired or message already edited
 *  Displays tooltip hints for edit restrictions
 *  Returns menu items array for Ant Design Dropdown
 *
 * Props:
 * - canEdit: boolean → whether editing is currently allowed
 * - onEdit: function → triggered when Edit clicked
 * - onDelete: function → triggered when Delete clicked
 * - msg: message object (used for conditions)
 * - timeSince: milliseconds since message was created
 * - EDIT_WINDOW_MS: allowed editing window duration
 */
export default function MessageMenu({
  canEdit,
  onEdit,
  onDelete,
  msg,
  timeSince,
  EDIT_WINDOW_MS,
}) {
  return [
    {
      key: "edit",
      label: (
        <Tooltip
          title={
            canEdit
              ? ""
              : msg.edited
              ? "You’ve already edited this message"
              : timeSince > EDIT_WINDOW_MS
              ? "You can only edit messages within 2 minutes"
              : "You can’t edit this message"
          }
          placement="left"
        >
          <span style={{ display: "inline-block", width: "100%" }}>
            <div
              onClick={() => canEdit && onEdit()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: canEdit ? 1 : 0.4,
                cursor: canEdit ? "pointer" : "not-allowed",
              }}
            >
              <EditOutlined /> Edit
            </div>
          </span>
        </Tooltip>
      ),
    },
    {
      key: "delete",
      label: (
        <div
          onClick={onDelete}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "red",
          }}
        >
          <DeleteOutlined /> Delete
        </div>
      ),
    },
  ];
}
