import { Typography, Card } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link } from "react-router-dom";

const { Title } = Typography;

const mockPosts = [
  {
    id: 1,
    title: "Epic Gameplay Highlights",
    category: "Gaming",
    creator: "Alex",
    img: "https://picsum.photos/400/250?random=1",
  },
  {
    id: 2,
    title: "Live Art Session",
    category: "Art",
    creator: "Sophia",
    img: "https://picsum.photos/400/250?random=2",
  },
  {
    id: 3,
    title: "Music Studio Jam",
    category: "Music",
    creator: "Clara",
    img: "https://picsum.photos/400/250?random=3",
  },
  {
    id: 4,
    title: "Morning Workout Routine",
    category: "Fitness",
    creator: "George",
    img: "https://picsum.photos/400/250?random=4",
  },
  {
    id: 5,
    title: "Behind the Scenes Podcast",
    category: "Talk Show",
    creator: "Liam",
    img: "https://picsum.photos/400/250?random=5",
  },
  {
    id: 6,
    title: "Cooking with Friends",
    category: "Food",
    creator: "Emma",
    img: "https://picsum.photos/400/250?random=6",
  },
];

export default function HotNow() {
  return (
    <div style={{ marginBottom: "40px" }}>
      <Title level={3}>Hot Now</Title>

      <Swiper
        spaceBetween={20}
        slidesOffsetBefore={12}
        slidesOffsetAfter={12}
        style={{ paddingBottom: "20px" }}
        breakpoints={{
          1024: { slidesPerView: 3.3 },
          768: { slidesPerView: 2.3 },
          0: { slidesPerView: 1.3 },
        }}
      >
        {mockPosts.map((post) => (
          <SwiperSlide key={post.id}>
            {" "}
            <Link to={`/video/${post.id}`} style={{ textDecoration: "none" }}>
              <Card
                hoverable
                cover={
                  <img
                    src={post.img}
                    alt={post.title}
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                }
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
                <Card.Meta
                  title={post.title}
                  description={`${post.category} • by ${post.creator}`}
                />
              </Card>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
