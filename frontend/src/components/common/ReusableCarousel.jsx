import { useRef, useState, useEffect, useCallback } from "react";
import { Carousel, Grid } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import ArrowButton from "./ArrowButton";

const { useBreakpoint } = Grid;

/**
 *
 * --------------------------------------
 * A responsive wrapper for Ant Design's Carousel.
 *
 * Responsibilities:
 *  Adjusts slides count per screen breakpoint
 *  Shows custom ArrowButton for navigation
 *  Handles boundary scrolling and arrow visibility
 *
 * Props:
 * - children: array of slide components
 * - settings: Ant Design Carousel config overrides
 * - slidesToShow: number or object defining responsive slides
 *   e.g. { default: 4.3, lg: 3.2, md: 2.3, sm: 1.2 }
 */
export default function ReusableCarousel({
  children,
  settings,
  slidesToShow: customSlides,
}) {
  const carouselRef = useRef(null);
  const screens = useBreakpoint();

  // --- Calculate slides to show dynamically ---
  let slidesToShow = customSlides || 4.3;
  if (typeof customSlides === "object") {
    if (screens.xl) slidesToShow = customSlides.default || 3.2;
    else if (screens.lg) slidesToShow = customSlides.lg || 2.2;
    else if (screens.md) slidesToShow = customSlides.md || 2.2;
    else if (screens.sm) slidesToShow = customSlides.sm || 1.2;
    else slidesToShow = customSlides.xs || 1.0;
  } else {
    if (!screens.lg && screens.md) slidesToShow = 3.3;
    if (!screens.md && screens.sm) slidesToShow = 2.3;
    if (!screens.sm) slidesToShow = 1.3;
  }

  const total = children.length;

  // --- Track which arrows should be visible ---
  const [showArrows, setShowArrows] = useState({
    left: false,
    right: total > slidesToShow,
  });

  // --- Adjust arrow visibility after each slide change ---
  const handleAfterChange = useCallback(
    (index) => {
      setShowArrows({
        left: index > 0,
        right: index + slidesToShow < total,
      });
    },
    [total, slidesToShow]
  );

  // --- Prevent scroll beyond last safe index ---
  const handleBeforeChange = (current, next) => {
    if (next + slidesToShow > total) {
      const safeIndex = Math.max(0, total - Math.ceil(slidesToShow));
      carouselRef.current?.goTo(safeIndex, true);
      return false;
    }
  };

  // --- Reset arrow state on mount / breakpoint change ---
  useEffect(() => {
    handleAfterChange(0);
  }, [handleAfterChange]);

  // --- Render ---
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
      {...settings} // allow external overrides
    >
      {/* Child slides with padding */}
      {children.map((child, idx) => (
        <div key={idx} style={{ padding: "0 12px" }}>
          {child}
        </div>
      ))}
    </Carousel>
  );
}
