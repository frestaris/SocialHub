import { Typography, Space } from "antd";
import { Link } from "react-router-dom";

const { Text } = Typography;

export default function Footer() {
  return (
    <div
      style={{
        padding: "16px",
        background: "#fff",
        textAlign: "center",
      }}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        {/* Links row */}
        <Space size="middle">
          <Link to="/about">
            <Text type="secondary" style={{ fontSize: 12 }}>
              About
            </Text>
          </Link>
          <Link to="/privacy">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Privacy
            </Text>
          </Link>
          <Link to="/terms">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Terms
            </Text>
          </Link>
        </Space>

        {/* Copyright */}
        <Text type="secondary" style={{ fontSize: 12 }}>
          © {new Date().getFullYear()}{" "}
          <a
            href="https://aris-fresta-web-developer.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1677ff" }}
          >
            Aris Fresta
          </a>
        </Text>
      </Space>
    </div>
  );
}
