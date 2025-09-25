import { Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import image from "../../assets/image-1.jpg";
import { useEffect, useRef } from "react";

const { Title, Paragraph } = Typography;

export default function Hero() {
  const textRef = useRef(null);
  const paraRef = useRef(null);

  const handleScroll = () => {
    const nextSection = document.getElementById("how-it-works");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const elements = [textRef.current, paraRef.current];
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

    elements.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.6)), url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        textAlign: "center",
        color: "#fff",
        padding: "0 20px",
      }}
    >
      {/* Centered content */}
      <div style={{ maxWidth: "800px" }}>
        <div ref={textRef} className="fade-element">
          <Title level={1} style={{ color: "#fff", marginBottom: "20px" }}>
            Your Community. Your Creators.
          </Title>
        </div>

        <div ref={paraRef} className="fade-element delay-1">
          <Paragraph style={{ fontSize: "18px", color: "#eee" }}>
            Support and discover amazing creators in one place.
          </Paragraph>
        </div>
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
            color: "#fff",
            animation: "bounce 1.5s infinite",
          }}
        />
      </div>

      {/* Animations */}
      <style>
        {`
          .fade-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
          }
          .fade-in-up {
            opacity: 1;
            transform: translateY(0);
          }
          .delay-1 { transition-delay: 0.2s; }

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
