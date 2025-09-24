import { Row, Col, Typography, Grid } from "antd";
import {
  UserAddOutlined,
  PlusCircleOutlined,
  MessageOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useEffect, useRef } from "react";

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const steps = [
  {
    id: 1,
    icon: <UserAddOutlined style={{ fontSize: "32px", color: "#1677ff" }} />,
    title: "Create Your Account",
    description: "Sign up and start sharing your own posts right away.",
  },
  {
    id: 2,
    icon: <PlusCircleOutlined style={{ fontSize: "32px", color: "#1677ff" }} />,
    title: "Upload Content",
    description:
      "Post images, videos, or just text — whatever you want to share.",
  },
  {
    id: 3,
    icon: <MessageOutlined style={{ fontSize: "32px", color: "#1677ff" }} />,
    title: "Explore & Engage",
    description:
      "Browse the feed, like posts, and join discussions with the community.",
  },
];

export default function HowItWorks() {
  const stepRefs = useRef([]);
  const screens = useBreakpoint();
  const isSmall = !screens.md;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    stepRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleScroll = () => {
    const nextSection = document.getElementById("hot-now");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      id="how-it-works"
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        position: "relative", // for chevron
        overflowX: "hidden",
      }}
    >
      <div
        style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}
      >
        <Title
          level={2}
          style={{
            marginTop: isSmall ? "84px" : "0px",
            marginBottom: "64px",
          }}
        >
          How It Works
        </Title>
        <Row gutter={[32, 32]} justify="center">
          {steps.map((step, i) => (
            <Col xs={24} sm={12} md={8} key={step.id}>
              <div
                ref={(el) => (stepRefs.current[i] = el)}
                className={`fade-element delay-${i}`}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    background: "#fff",
                  }}
                >
                  {step.icon}
                  <Title level={4} style={{ marginTop: "16px" }}>
                    {step.title}
                  </Title>
                  <Paragraph>{step.description}</Paragraph>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Chevron pinned to bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          cursor: "pointer",
        }}
        onClick={handleScroll}
      >
        <DownOutlined
          style={{
            fontSize: "32px",
            color: "#555",
            animation: "bounce 1.5s infinite",
          }}
        />
      </div>

      {/* Animations */}
      <style>
        {`
          .fade-element {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.6s ease, transform 0.6s ease;
          }
          .fade-in-up {
            opacity: 1;
            transform: translateY(0);
          }
          .delay-0 { transition-delay: 0s; }
          .delay-1 { transition-delay: 0.2s; }
          .delay-2 { transition-delay: 0.4s; }

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(6px); }
            60% { transform: translateY(3px); }
          }
        `}
      </style>
    </div>
  );
}
