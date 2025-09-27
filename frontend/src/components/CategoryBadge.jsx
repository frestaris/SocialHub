import { Tag, Grid } from "antd";
import { categories, categoryColors } from "../utils/categories";

const { useBreakpoint } = Grid;

export default function CategoryBadge({ category }) {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  // Find the category object (label + icon) from utils
  const categoryObj = categories.find((c) => c.key === category);

  // Fallback: use raw category string if not found
  const label = categoryObj?.label || category;

  return (
    <Tag
      color={categoryColors[category] || "default"}
      style={{
        fontSize: isMobile ? "10px" : "12px",
        padding: isMobile ? "2px 6px" : "4px 10px",
        borderRadius: "12px",
        margin: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {categoryObj?.icon && <categoryObj.icon />}
      {label}
    </Tag>
  );
}
