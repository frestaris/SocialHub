import { Row, Col, Typography, Card } from "antd";
import {
  UserAddOutlined,
  VideoCameraOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;

const steps = [
  {
    id: 1,
    icon: <UserAddOutlined style={{ fontSize: "32px", color: "#1677ff" }} />,
    title: "Sign Up",
    description:
      "Create your account as a fan or creator in just a few clicks.",
  },
  {
    id: 2,
    icon: (
      <VideoCameraOutlined style={{ fontSize: "32px", color: "#1677ff" }} />
    ),
    title: "Share & Discover",
    description:
      "Creators upload content, fans explore and subscribe to favorites.",
  },
  {
    id: 3,
    icon: <DollarOutlined style={{ fontSize: "32px", color: "#1677ff" }} />,
    title: "Support Creators",
    description:
      "Fans subscribe or tip directly, creators earn money instantly.",
  },
];

export default function HowItWorks() {
  return (
    <div
      id="how-it-works"
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}
      >
        <Title level={2} style={{ marginBottom: "40px" }}>
          How It Works
        </Title>
        <Row
          gutter={[32, 32]}
          justify="center"
          style={{ marginLeft: 0, marginRight: 0 }}
        >
          {steps.map((step, i) => (
            <Col xs={24} sm={12} md={8} key={step.id}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <Card variant={false} style={{ textAlign: "center" }}>
                  {step.icon}
                  <Title level={4} style={{ marginTop: "16px" }}>
                    {step.title}
                  </Title>
                  <Paragraph>{step.description}</Paragraph>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
