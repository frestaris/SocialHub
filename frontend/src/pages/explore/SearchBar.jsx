import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export default function SearchBar() {
  return (
    <Input
      placeholder="Search videos..."
      size="large"
      suffix={<SearchOutlined style={{ color: "#888" }} />}
      style={{
        width: "100%",
        maxWidth: 500,
        border: "1px solid #ddd",
        borderRadius: "6px",
      }}
    />
  );
}
