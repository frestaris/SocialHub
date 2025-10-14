import { Typography, Space } from "antd";
import { Link } from "react-router-dom";

const { Text } = Typography;

/**
 *
 * --------------------------------------
 * Displays the global footer with legal links and author credit.
 *
 * Responsibilities:
 *  Provides quick navigation to About, Privacy, and Terms pages
 *  Shows copyright notice with external link
 *  Maintains consistent spacing and styling with Ant Design
 */
export default function Footer() {
  return (
    <div
      style={{
        padding: "16px",
        background: "#fff",
        textAlign: "center",
        borderTop: "1px solid #f0f0f0",
      }}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        {/* Navigation Links */}
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

        {/*  Copyright + Credit */}
        <Text type="secondary" style={{ fontSize: 12 }}>
          © {new Date().getFullYear()}{" "}
          <a
            href="https://aris-fresta-web-developer.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1677ff", fontWeight: 500 }}
          >
            Aris Fresta
          </a>
        </Text>
      </Space>
    </div>
  );
}
