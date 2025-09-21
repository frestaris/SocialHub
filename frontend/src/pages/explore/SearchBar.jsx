import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export default function SearchBar({ value, onChange }) {
  return (
    <Input
      placeholder="Search posts..."
      size="large"
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
