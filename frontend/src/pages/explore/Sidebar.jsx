// ---  Libraries ---
import { Menu } from "antd";

// --- Routing ---
import { useNavigate } from "react-router-dom";

// --- Utils ---
import { categories } from "../../utils/posts/categories";
import imageBg from "../../assets/bg-card-1.jpg";

export default function Sidebar({
  selectedCategories = [],
  onCategoryChange,
  onClose,
}) {
  const navigate = useNavigate();

  // --- Handle category selection ---
  const handleCategoryClick = ({ key }) => {
    if (selectedCategories.includes(key)) {
      // Deselect category → reset explore
      onCategoryChange([]);
      navigate("/explore");
    } else {
      // Select category → navigate with key
      onCategoryChange([key]);
      navigate(`/explore/${key}`);
    }

    // Close Drawer (on mobile)
    if (onClose) onClose();
  };

  return (
    <Menu
      mode="inline"
      selectable={false}
      selectedKeys={selectedCategories}
      onClick={handleCategoryClick}
      style={{
        position: "sticky",
        height: "100%",
        borderRight: 0,
        backgroundImage: `linear-gradient(
          rgba(255, 255, 255, 0.94),
          rgba(255, 255, 255, 0.94)
        ), url(${imageBg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      items={categories.map((c) => ({
        key: c.key,
        icon: <c.icon />,
        label: c.label,
      }))}
    />
  );
}
