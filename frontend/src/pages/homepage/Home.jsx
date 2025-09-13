import { Row, Col, Typography, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import image from "../../assets/quickpop-homepage.png";

const { Title, Paragraph } = Typography;

export default function Home() {
  const handleScroll = () => {
    const nextSection = document.getElementById("how-it-works");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)", // subtract navbar
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Content */}
      <Row
        gutter={[32, 32]}
        align="middle"
        justify="center"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          flex: 1,
        }}
      >
        {/* Left: Text */}
        <Col xs={24} md={12}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Title level={1} style={{ marginBottom: "20px" }}>
              Discover & Support Your Favorite Creators
            </Title>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Paragraph style={{ fontSize: "18px", color: "#555" }}>
              Subscribe to exclusive content, watch live streams, and connect
              directly with creators you love.
            </Paragraph>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button type="primary" size="large">
              Get Started
            </Button>
          </motion.div>
        </Col>

        {/* Right: Image */}
        <Col xs={24} md={12} style={{ textAlign: "center" }}>
          <motion.img
            src={image}
            alt="Creators"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            style={{
              maxWidth: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          />
        </Col>
      </Row>

      {/* Chevron */}
      <div
        style={{
          textAlign: "center",
          padding: "20px 0",
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

      {/* Bounce Animation */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(6px);
            }
            60% {
              transform: translateY(3px);
            }
          }
        `}
      </style>
    </div>
  );
}
