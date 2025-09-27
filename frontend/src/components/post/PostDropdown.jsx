// --- Ant Design ---
import { Dropdown, Button } from "antd";
import { EditOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";

export default function PostDropdown({
  item,
  onEdit,
  onDelete,
  size = "large",
  loading = false,
}) {
  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "edit",
            label: "Edit",
            icon: <EditOutlined />,
            onClick: () => onEdit(item),
          },
          {
            key: "delete",
            label: "Delete",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => onDelete(item),
          },
        ],
      }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="text"
        size={size}
        icon={<MoreOutlined style={{ fontSize: size === "small" ? 16 : 20 }} />}
        shape="circle"
        loading={loading}
      />
    </Dropdown>
  );
}
