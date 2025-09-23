import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export default function SearchBar({ value, onChange, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch(value);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: 500,
        background: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "9999px",
        padding: "2px 8px",
      }}
    >
      <Input
        placeholder="Search"
        size="large"
        variant="borderless"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          borderRadius: "9999px",
          background: "transparent",
          boxShadow: "none",
        }}
      />
      <Button
        type="text"
        icon={<SearchOutlined style={{ color: "#555", fontSize: 18 }} />}
        onClick={() => onSearch(value)}
        style={{
          borderRadius: "50%",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e0e0e0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#f0f0f0";
        }}
      />
    </div>
  );
}
