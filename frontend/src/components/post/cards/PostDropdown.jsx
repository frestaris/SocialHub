// --- Ant Design ---
import { Dropdown, Button } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

export default function PostDropdown({
  item,
  onEdit,
  onDelete,
  onHide,
  size = "large",
  loading = false,
  showHideOption = true,
}) {
  const menuItems = [];

  if (showHideOption) {
    menuItems.push({
      key: "hide",
      label: item.hidden ? "Show" : "Hide",
      icon: item.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />,
      onClick: () => {
        if (onHide) onHide(item);
      },
    });
  }

  menuItems.push(
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
    }
  );

  return (
    <Dropdown
      menu={{ items: menuItems }}
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
