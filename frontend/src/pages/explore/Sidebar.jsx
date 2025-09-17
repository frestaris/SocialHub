import { Menu } from "antd";
import { categories } from "../../utils/categories";

export default function Sidebar() {
  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={["gaming"]}
      style={{ position: "sticky", height: "100%", borderRight: 0 }}
      items={categories.map((c) => ({
        key: c.key,
        icon: <c.icon />,
        label: c.label,
      }))}
    />
  );
}
