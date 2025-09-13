import { Typography, Card, Row, Col } from "antd";
import { motion } from "framer-motion";

const { Title } = Typography;

const trending = [
  {
    id: 1,
    title: "Epic Gameplay",
    category: "Gaming",
    img: "https://picsum.photos/400/200?1",
  },
  {
    id: 2,
    title: "Art Tutorial",
    category: "Art",
    img: "https://picsum.photos/400/200?2",
  },
  {
    id: 3,
    title: "Workout Routine",
    category: "Fitness",
    img: "https://picsum.photos/400/200?3",
  },
];

export default function TrendingNow() {
  return (
    <div
      style={{ minHeight: "100vh", background: "#fff", padding: "60px 20px" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          Trending Now
        </Title>
        <Row gutter={[24, 24]}>
          {trending.map((item, i) => (
            <Col xs={24} md={8} key={item.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  hoverable
                  cover={
                    <img
                      src={item.img}
                      alt={item.title}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  }
                >
                  <Card.Meta title={item.title} description={item.category} />
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
