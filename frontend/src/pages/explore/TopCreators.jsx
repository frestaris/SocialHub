import { Typography } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link } from "react-router-dom";

const { Title } = Typography;

const mockCreators = [
  {
    id: 1,
    name: "StreamerOne",
    category: "Gaming",
    img: "https://picsum.photos/200/200?random=1",
  },
  {
    id: 2,
    name: "ProGamer",
    category: "Esports",
    img: "https://picsum.photos/200/200?random=2",
  },
  {
    id: 3,
    name: "ArtWizard",
    category: "Art",
    img: "https://picsum.photos/200/200?random=3",
  },
  {
    id: 4,
    name: "FitGuru",
    category: "Fitness",
    img: "https://picsum.photos/200/200?random=4",
  },
  {
    id: 5,
    name: "MusicLover",
    category: "Music",
    img: "https://picsum.photos/200/200?random=5",
  },
  {
    id: 6,
    name: "CodeMaster",
    category: "Tech",
    img: "https://picsum.photos/200/200?random=6",
  },
  {
    id: 7,
    name: "DanceQueen",
    category: "Dance",
    img: "https://picsum.photos/200/200?random=7",
  },
  {
    id: 8,
    name: "ChefExtra",
    category: "Food",
    img: "https://picsum.photos/200/200?random=8",
  },
];

export default function TopCreators() {
  return (
    <div style={{ marginBottom: "40px" }}>
      <Title level={3}>Top Creators</Title>

      <Swiper
        spaceBetween={20}
        slidesOffsetBefore={12}
        slidesOffsetAfter={12}
        style={{ paddingBottom: "20px" }}
        breakpoints={{
          1024: { slidesPerView: 4.4 },
          768: { slidesPerView: 2.4 },
          0: { slidesPerView: 1.4 },
        }}
      >
        {mockCreators.map((creator) => (
          <SwiperSlide key={creator.id}>
            <Link
              to={`/profile/${creator.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "20px",
                  textAlign: "center",
                  backgroundClip: "padding-box, border-box",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                }}
              >
                <img
                  src={creator.img}
                  alt={creator.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "12px",
                    border: "3px solid #eee",
                  }}
                />
                <h3 style={{ margin: "0 0 4px", color: "#333" }}>
                  {creator.name}
                </h3>
                <p style={{ color: "#777", margin: "0 0 12px" }}>
                  {creator.category}
                </p>
                <button
                  style={{
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background: "linear-gradient(90deg, #00c6ff, #0072ff)",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(0, 198, 255, 0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Follow
                </button>
              </div>{" "}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
