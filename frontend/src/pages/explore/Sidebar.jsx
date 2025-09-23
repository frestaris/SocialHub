import { Menu } from "antd";
import { categories } from "../../utils/categories";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  selectedCategories = [],
  onCategoryChange,
  onClose,
}) {
  const navigate = useNavigate();

  const handleCategoryClick = ({ key }) => {
    if (selectedCategories.includes(key)) {
      onCategoryChange([]);
      navigate("/explore");
    } else {
      onCategoryChange([key]);
      navigate(`/explore/${key}`);
    }

    if (onClose) onClose();
  };

  return (
    <Menu
      mode="inline"
      selectable={false}
      selectedKeys={selectedCategories}
      style={{ position: "sticky", height: "100%", borderRight: 0 }}
      onClick={handleCategoryClick}
      items={categories.map((c) => ({
        key: c.key,
        icon: <c.icon />,
        label: c.label,
      }))}
    />
  );
}
