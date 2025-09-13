import { Menu } from "antd";
import {
  HomeOutlined,
  FireOutlined,
  PlayCircleOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

const categories = [
  { key: "gaming", icon: <PlayCircleOutlined />, label: "Gaming" },
  { key: "music", icon: <CustomerServiceOutlined />, label: "Music" },
  { key: "art", icon: <FireOutlined />, label: "Art" },
  { key: "fitness", icon: <HomeOutlined />, label: "Fitness" },
];

export default function Sidebar() {
  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={["gaming"]}
      style={{ height: "100%", borderRight: 0 }}
      items={categories}
    />
  );
}
