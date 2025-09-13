import { useState, useRef, useEffect } from "react";
import { Typography, Avatar, Button, Grid } from "antd";
import {
  LikeOutlined,
  ShareAltOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function VideoInfo({ video }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef(null);

  const screens = useBreakpoint();

  useEffect(() => {
    if (descRef.current) {
      const el = descRef.current;
      const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10);
      const maxHeight = lineHeight * 2;

      if (el.scrollHeight > maxHeight) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    }
  }, [video?.description]);

  return (
    <div style={{ marginBottom: "20px" }}>
      <Title level={3} style={{ marginBottom: "10px" }}>
        {video?.title}
      </Title>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        {/* Creator Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Avatar size="large" icon={<UserOutlined />} />
          <div>
            <Text strong>{video?.creator}</Text>
            <br />
            <Text type="secondary">{video?.subscribers} subscribers</Text>
          </div>
          <Button type="primary" style={{ marginLeft: "12px" }}>
            Subscribe
          </Button>
        </div>

        {/* Actions */}
        {screens.xs ? (
          <div
            style={{
              flexBasis: "100%",
              display: "flex",
              gap: "12px",
            }}
          >
            <Button icon={<LikeOutlined />}>{video?.likes}</Button>
            <Button icon={<ShareAltOutlined />}>Share</Button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "12px" }}>
            <Button icon={<LikeOutlined />}>{video?.likes}</Button>
            <Button icon={<ShareAltOutlined />}>Share</Button>
          </div>
        )}
      </div>

      {/* Description */}
      <div
        style={{
          marginTop: "16px",
          background: "#e7e7e7",
          padding: "12px",
          borderRadius: "8px",
        }}
      >
        <Paragraph
          ellipsis={!expanded ? { rows: 2, expandable: false } : false}
          style={{ marginBottom: "8px" }}
        >
          {video?.description}
        </Paragraph>
        {isOverflowing && (
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show Less" : "Show More"}
          </Button>
        )}
      </div>
    </div>
  );
}
