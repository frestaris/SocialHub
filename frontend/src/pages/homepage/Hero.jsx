import { useEffect, useRef } from "react";
import { Typography, Grid } from "antd";
import { DownOutlined, CompassOutlined } from "@ant-design/icons";
import image from "../../assets/hero.avif";
import GradientButton from "../../components/common/GradientButton";

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function Hero() {
  const textRef = useRef(null);
  const paraRef = useRef(null);
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  // --- Scroll to the "How It Works" section ---
  const handleScroll = () => {
    const next = document.getElementById("how-it-works");
    next?.scrollIntoView({ behavior: "smooth" });
  };

  // --- Fade-in animation setup for heading and paragraph ---
  useEffect(() => {
    const els = [textRef.current, paraRef.current];
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("fade-in-up");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.2 }
    );
    els.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)", // full viewport minus navbar height
        backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.35)), url(${image})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        textAlign: "center",
        color: "#fff",
        backgroundColor: "#5e8aed",
      }}
    >
      {/* --- Text & CTA content --- */}
      <div style={{ maxWidth: 800 }}>
        {/* Heading with fade-in animation */}
        <div ref={textRef} className="fade-element">
          <Title level={1} style={{ color: "#fff", marginBottom: 20 }}>
            Your Community. Your Creators.
          </Title>
        </div>

        {/* Subtext and button */}
        <div ref={paraRef} className="fade-element delay-1">
          <Paragraph style={{ fontSize: 18, color: "#eee" }}>
            Support and discover amazing creators in one place.
          </Paragraph>

          {/* Explore button */}
          <GradientButton
            icon={<CompassOutlined style={{ fontSize: 20 }} />}
            text="Explore Now"
            onClick={() => (window.location.href = "/explore")}
            style={{
              marginTop: 20,
              border: "2px solid #ffffffaa",
              fontWeight: 600,
              padding: "0 32px",
              height: 48,
              borderRadius: 8,
            }}
          />
        </div>
      </div>

      {/* --- Scroll-down arrow --- */}
      <div
        style={{
          position: "absolute",
          bottom: isMobile ? 80 : 20,
          left: "50%",
          transform: "translateX(-50%)",
          cursor: "pointer",
        }}
        onClick={handleScroll}
      >
        <DownOutlined
          style={{
            fontSize: 32,
            color: "#fff",
            animation: "bounce 1.5s infinite",
          }}
        />
      </div>

      {/* --- Inline styles for animations --- */}
      <style>{`
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
          0%,20%,50%,80%,100% { transform: translateY(0); }
          40% { transform: translateY(6px); }
          60% { transform: translateY(3px); }
        }
      `}</style>
    </div>
  );
}
