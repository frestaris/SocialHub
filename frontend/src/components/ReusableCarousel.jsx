import { useRef, useState, useEffect, useCallback } from "react";
import { Carousel, Grid } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

import ArrowButton from "../components/ArrowButton";

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
