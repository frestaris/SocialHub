import { Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import TopCreators from "../explore/TopCreators";

const { Title, Paragraph } = Typography;

export default function FeaturedCreators() {
  const handleScrollNext = () => {
    const nextSection = document.getElementById("trending-posts");
    if (nextSection) {
      const yOffset = -64;
      const y =
        nextSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section
      id="featured-creators"
      style={{
        background: "#f9fafc",
        minHeight: "calc(100vh - 64px)",
        textAlign: "center",
        position: "relative",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* --- Content container --- */}
      <div
        style={{
          margin: "0 auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Title level={2} style={{ marginBottom: 12 }}>
          Meet Our Top Creators
        </Title>
        <Paragraph style={{ color: "#555", marginBottom: 40 }}>
          Discover inspiring creators sharing their passion through videos,
          posts, and live sessions.
        </Paragraph>
        <TopCreators hideTitle />
      </div>

      {/* --- Scroll-down button --- */}
      <div
        onClick={handleScrollNext}
        style={{
          marginTop: 20,
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 20,
        }}
      >
        <DownOutlined
          style={{
            fontSize: 28,
            color: "#1677ff",
            animation: "bounce 1.5s infinite",
          }}
        />
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(6px); }
            60% { transform: translateY(3px); }
          }
        `}
      </style>
    </section>
  );
}
