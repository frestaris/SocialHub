import { Typography, Row, Col, Card, Divider } from "antd";
import {
  ThunderboltOutlined,
  ApiOutlined,
  CloudOutlined,
  MessageOutlined,
  TeamOutlined,
  LockOutlined,
} from "@ant-design/icons";
import imageBg from "../../assets/bg-card-2.jpg";

const { Title, Paragraph, Text } = Typography;

export default function About() {
  return (
    <section
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(
          rgba(255, 255, 255, 0.92),
          rgba(255, 255, 255, 0.92)
        ), url(${imageBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        {/* --- Header --- */}
        <Title level={2} style={{ color: "#1e293b" }}>
          About <span style={{ color: "#1677ff" }}>Social Hub</span>
        </Title>
        <Paragraph
          style={{
            fontSize: 16,
            color: "#555",
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          <Text strong>Social Hub</Text> is a full-stack social platform
          designed for creators and communities. Built with modern technologies,
          it combines posts, real-time chat, notifications, and analytics — all
          wrapped in a clean, responsive UI powered by React and Ant Design.
        </Paragraph>

        <Divider style={{ margin: "60px 0" }} />

        {/* --- Tech Overview --- */}
        <Title
          level={3}
          style={{
            margin: "40px 0",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#1677ff",
              padding: "8px 24px",
              borderRadius: 30,
              fontWeight: 600,
              boxShadow:
                "0 4px 12px rgba(99, 102, 241, 0.3), 0 0 10px rgba(59, 130, 246, 0.25)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            Core Architecture
          </span>
        </Title>

        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card
              variant={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(0,0,0,0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.08)")
              }
            >
              <ThunderboltOutlined style={{ fontSize: 32, color: "#1677ff" }} />
              <Title level={4}>Frontend</Title>
              <Paragraph>
                React + Redux Toolkit for state management, with Ant Design for
                elegant, accessible UI components.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              variant={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(0,0,0,0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.08)")
              }
            >
              <ApiOutlined style={{ fontSize: 32, color: "#52c41a" }} />
              <Title level={4}>Backend</Title>
              <Paragraph>
                Node.js + Express API connected to MongoDB Atlas, following REST
                principles for clean scalability.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              variant={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(0,0,0,0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.08)")
              }
            >
              <CloudOutlined style={{ fontSize: 32, color: "#faad14" }} />
              <Title level={4}>Hosting & Auth</Title>
              <Paragraph>
                Firebase powers authentication (Google, GitHub, email/password)
                and storage for user-generated media.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: "60px 0" }} />

        {/* --- Features --- */}
        <Title
          level={3}
          style={{
            margin: "40px 0",
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#1677ff",
              padding: "8px 24px",
              borderRadius: 30,
              fontWeight: 600,
              boxShadow:
                "0 4px 12px rgba(99, 102, 241, 0.3), 0 0 10px rgba(59, 130, 246, 0.25)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            Functionalities
          </span>
        </Title>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Card
              variant={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(0,0,0,0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.08)")
              }
            >
              <MessageOutlined style={{ fontSize: 32, color: "#1677ff" }} />
              <Title level={4}>Real-Time Chat</Title>
              <Paragraph>
                Socket.IO enables live messaging, typing indicators, and read
                receipts across devices.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              variant={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(0,0,0,0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.08)")
              }
            >
              <TeamOutlined style={{ fontSize: 32, color: "#52c41a" }} />
              <Title level={4}>Creators & Community</Title>
              <Paragraph>
                Users can post, like, comment, reply, share and follow others to
                build their own creative space.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              variant={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(0,0,0,0.12)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.08)")
              }
            >
              <LockOutlined style={{ fontSize: 32, color: "#faad14" }} />
              <Title level={4}>Security</Title>
              <Paragraph>
                Authentication handled via Firebase ID tokens and secure
                HTTP-only sessions on the backend.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: "60px 0" }} />

        {/* --- Footer paragraph --- */}
        <Paragraph style={{ fontSize: 16, color: "#555", marginTop: 40 }}>
          <Text strong>Social Hub</Text> is a continuously evolving project
          focused on blending community and technology. It’s fully open source —
          built for learning, collaboration, and innovation.{" "}
          <a
            href="https://github.com/frestaris/SocialHub"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1677ff", fontWeight: 500 }}
          >
            View on GitHub →
          </a>
        </Paragraph>
      </div>
    </section>
  );
}
