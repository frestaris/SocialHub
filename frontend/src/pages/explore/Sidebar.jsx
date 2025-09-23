import { Menu } from "antd";
import { categories } from "../../utils/categories";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ selectedCategories = [], onCategoryChange }) {
  const navigate = useNavigate();

  const handleCategoryClick = (key) => {
    if (selectedCategories.includes(key)) {
      // remove category filter
      onCategoryChange(selectedCategories.filter((c) => c !== key));
      navigate("/explore");
    } else {
      onCategoryChange([key]); // only one active category
      navigate(`/explore/${key}`);
    }
  };

  return (
    <Menu
      mode="inline"
      selectable={false}
      style={{ position: "sticky", height: "100%", borderRight: 0 }}
      items={categories.map((c) => {
        const isActive = selectedCategories.includes(c.key);
        return {
          key: c.key,
          className: isActive ? "menu-item-active" : "",
          icon: <c.icon />,
          label: (
            <div
              onClick={() => handleCategoryClick(c.key)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                cursor: "pointer",
              }}
            >
              <span>{c.label}</span>
            </div>
          ),
        };
      })}
    />
  );
}
