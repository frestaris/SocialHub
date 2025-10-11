import { useEffect, useRef } from "react";
import { Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import image from "../../assets/image-hero.avif";

const { Title, Paragraph } = Typography;

export default function Hero() {
  const textRef = useRef(null);
  const paraRef = useRef(null);

  const handleScroll = () => {
    const next = document.getElementById("how-it-works");
    next?.scrollIntoView({ behavior: "smooth" });
  };

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
        minHeight: "calc(100vh - 64px)",
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
      <div style={{ maxWidth: 800 }}>
        <div ref={textRef} className="fade-element">
          <Title level={1} style={{ color: "#fff", marginBottom: 20 }}>
            Your Community. Your Creators.
          </Title>
        </div>
        <div ref={paraRef} className="fade-element delay-1">
          <Paragraph style={{ fontSize: 18, color: "#eee" }}>
            Support and discover amazing creators in one place.
          </Paragraph>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 20,
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
