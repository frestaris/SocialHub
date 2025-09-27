import { useRef, useState, useEffect, useCallback } from "react";
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

export default function ReusableCarousel({
  children,
  settings,
  slidesToShow: customSlides,
}) {
  const carouselRef = useRef(null);
  const screens = useBreakpoint();

  // ---  Calculate slidesToShow ---
  let slidesToShow = customSlides || 4.3; // fallback default

  if (typeof customSlides === "object") {
    // Custom slides per breakpoint (preferred)
    if (screens.xl) slidesToShow = customSlides.default || 3.2;
    else if (screens.lg) slidesToShow = customSlides.lg || 2.2;
    else if (screens.md) slidesToShow = customSlides.md || 2.2;
    else if (screens.sm) slidesToShow = customSlides.sm || 1.2;
    else slidesToShow = customSlides.xs || 1.0;
  } else {
    // Fallback hardcoded breakpoints
    if (!screens.lg && screens.md) slidesToShow = 3.3;
    if (!screens.md && screens.sm) slidesToShow = 2.3;
    if (!screens.sm) slidesToShow = 1.3;
  }

  const total = children.length;

  // ---  Arrow state (show/hide left/right) ---
  const [showArrows, setShowArrows] = useState({
    left: false,
    right: total > slidesToShow,
  });

  // ---  After slide change → adjust arrows ---
  const handleAfterChange = useCallback(
    (index) => {
      setShowArrows({
        left: index > 0,
        right: index + slidesToShow < total,
      });
    },
    [total, slidesToShow]
  );

  // ---  Prevent scrolling beyond last safe index ---
  const handleBeforeChange = (current, next) => {
    if (next + slidesToShow > total) {
      const safeIndex = Math.max(0, total - Math.ceil(slidesToShow));
      carouselRef.current?.goTo(safeIndex, true);
      return false;
    }
  };

  // ---  Reset arrows on mount or when breakpoints change ---
  useEffect(() => {
    handleAfterChange(0);
  }, [handleAfterChange]);

  // ---  Render Carousel ---
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
      {...settings} // allow overrides
    >
      {children.map((child, idx) => (
        <div key={idx} style={{ padding: "0 12px" }}>
          {child}
        </div>
      ))}
    </Carousel>
  );
}
