import { Tag, Grid } from "antd";
import { categories, categoryColors } from "../../utils/posts/categories";

const { useBreakpoint } = Grid;

/**
 *
 * --------------------------------------
 * Displays a colored label (Tag) for a post’s category.
 *
 * Responsibilities:
 *  Uses global category definitions (label + icon)
 *  Adjusts size for mobile breakpoints
 *  Fallbacks gracefully if category not recognized
 *
 * Props:
 * - category: string → category key (e.g. "music", "travel")
 */
export default function CategoryBadge({ category }) {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  //  Match category data (label & icon)
  const categoryObj = categories.find((c) => c.key === category);

  //  Fallback to plain text if not found
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
      {/*  Icon + Label */}
      {categoryObj?.icon && <categoryObj.icon />}
      {label}
    </Tag>
  );
}
