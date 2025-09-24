import { useRef, useState, useEffect } from "react";
import { Carousel, Grid } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

const ArrowButton = ({ icon, onClick, position, disabled }) => {
  const [hovered, setHovered] = useState(false);

  if (disabled) return null;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: hovered ? "#d9d9d9" : "#e5e5e5",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        cursor: "pointer",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 2,
        ...(position === "left"
          ? { left: 5, marginLeft: 8 }
          : { right: 5, marginRight: 8 }),
      }}
    >
      {icon}
    </div>
  );
};

export default function ReusableCarousel({ children, settings }) {
  const carouselRef = useRef(null);
  const screens = useBreakpoint();

  // 👇 calculate slidesToShow based on breakpoint
  let slidesToShow = 4.3;
  if (!screens.lg && screens.md) slidesToShow = 3.3; // tablet
  if (!screens.md && screens.sm) slidesToShow = 2.3; // small tablet
  if (!screens.sm) slidesToShow = 1.3; // mobile

  const total = children.length;
  const [showArrows, setShowArrows] = useState({
    left: false,
    right: total > slidesToShow,
  });

  const handleAfterChange = (index) => {
    setShowArrows({
      left: index > 0,
      right: index + slidesToShow < total,
    });
  };

  const handleBeforeChange = (current, next) => {
    if (next + slidesToShow > total) {
      const safeIndex = Math.max(0, total - Math.ceil(slidesToShow));
      carouselRef.current?.goTo(safeIndex, true);
      return false;
    }
  };

  useEffect(() => {
    handleAfterChange(0);
  }, [total, slidesToShow]);

  return (
    <Carousel
      ref={carouselRef}
      dots={false}
      infinite={false}
      draggable={false}
      swipe={false}
      arrows
      prevArrow={
        <ArrowButton
          icon={<LeftOutlined style={{ fontSize: 16, color: "#333" }} />}
          position="left"
          disabled={!showArrows.left}
        />
      }
      nextArrow={
        <ArrowButton
          icon={<RightOutlined style={{ fontSize: 16, color: "#333" }} />}
          position="right"
          disabled={!showArrows.right}
        />
      }
      slidesToShow={slidesToShow}
      slidesToScroll={1}
      beforeChange={handleBeforeChange}
      afterChange={handleAfterChange}
      {...settings}
    >
      {children.map((child, idx) => (
        <div key={idx} style={{ padding: "0 12px" }}>
          {child}
        </div>
      ))}
    </Carousel>
  );
}
