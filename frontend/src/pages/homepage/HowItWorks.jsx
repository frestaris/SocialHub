import { useEffect, useRef } from "react";
import { Row, Col, Typography, Button } from "antd";
import {
  UserAddOutlined,
  PlusCircleOutlined,
  MessageOutlined,
  CompassOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import image from "../../assets/image-banner.png";
const { Title, Paragraph } = Typography;

// --- Steps data ---
const steps = [
  {
    id: 1,
    icon: <UserAddOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
    title: "Create Your Account",
    description: "Sign up and start sharing your own posts right away.",
  },
  {
    id: 2,
    icon: <PlusCircleOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
    title: "Upload Content",
    description:
      "Post videos, images, or just text — whatever fits your style.",
  },
  {
    id: 3,
    icon: <MessageOutlined style={{ fontSize: 32, color: "#1677ff" }} />,
    title: "Engage with the Community",
    description:
      "Chat live, follow your favorite creators, and join the conversation.",
  },
];

export default function HowItWorks() {
  const stepRefs = useRef([]);
  const ctaRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleCTA = () => (user ? navigate("/explore") : navigate("/login"));

  const handleScrollNext = () => {
    const nextSection = document.getElementById("featured-creators");
    if (nextSection) {
      const yOffset = -64;
      const y =
        nextSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

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
    if (ctaRef.current) observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      style={{
        background: "#fafafa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "center",
        padding: "100px 20px",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Steps content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", flexGrow: 1 }}>
        <Row
          gutter={[32, 32]}
          justify="center"
          align="middle"
          style={{ height: "100%" }}
        >
          {steps.map((step, i) => (
            <Col xs={24} sm={12} md={8} key={step.id}>
              <div
                ref={(el) => (stepRefs.current[i] = el)}
                className={`fade-element delay-${i}`}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "transform 0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-6px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  {step.icon}
                  <Title level={4} style={{ marginTop: 16 }}>
                    {step.title}
                  </Title>
                  <Paragraph style={{ color: "#555" }}>
                    {step.description}
                  </Paragraph>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA fills lower half */}
      <div
        ref={ctaRef}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.3)), url(${image})`,

          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",

          borderRadius: 12,
          color: "#fff",
          padding: "80px 20px 100px",
          marginTop: 40,
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Title level={2} style={{ color: "#fff" }}>
            Join a Community of Creators & Fans
          </Title>
          <Paragraph
            style={{ fontSize: 18, color: "#e0e0e0", marginBottom: 40 }}
          >
            Connect, share, and chat in real time with people who inspire you.
          </Paragraph>

          <Button
            type="primary"
            size="large"
            icon={<CompassOutlined />}
            style={{
              marginRight: 16,
              background: "#5e8aed",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#5e8aed";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(34,211,238,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#5e8aed";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={handleCTA}
          >
            {user ? "Explore Now" : "Get Started"}
          </Button>

          {/* Scroll-down button */}
          <div
            onClick={handleScrollNext}
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "pointer",
            }}
          >
            <DownOutlined
              style={{
                fontSize: 28,
                color: "#fff",
                animation: "bounce 1.5s infinite",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
