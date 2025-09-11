import { Typography, Card } from "antd";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

const { Title } = Typography;

const creators = [
  {
    id: 1,
    name: "George",
    category: "Fitness",
    img: "https://images.unsplash.com/photo-1457449940276-e8deed18bfff?q=80&w=1170&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Bob",
    category: "Gaming",
    img: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1085&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Clara",
    category: "Music",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=764&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Sophie",
    category: "Art",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=900&auto=format&fit=crop",
  },
];

export default function FeaturedCreators() {
  return (
    <div
      id="featured-creators"
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        overflowX: "hidden",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          Featured Creators
        </Title>

        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={3.2}
          centeredSlides={false}
          breakpoints={{
            1024: { slidesPerView: 3 },
            768: { slidesPerView: 2 },
            0: { slidesPerView: 1.2 }, // 👈 peek effect on mobile
          }}
        >
          {creators.map((creator, i) => (
            <SwiperSlide key={creator.id}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <Card
                  hoverable
                  cover={
                    <img
                      alt={creator.name}
                      src={creator.img}
                      style={{
                        height: "200px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                  }
                  style={{ borderRadius: "12px", overflow: "hidden" }}
                >
                  <Card.Meta
                    title={creator.name}
                    description={creator.category}
                  />
                </Card>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
