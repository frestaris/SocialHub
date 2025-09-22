import { Menu } from "antd";
import { categories } from "../../utils/categories";

export default function Sidebar({ selectedCategories = [], onCategoryChange }) {
  const toggleCategory = (key) => {
    if (selectedCategories.includes(key)) {
      onCategoryChange(selectedCategories.filter((c) => c !== key));
    } else {
      onCategoryChange([...selectedCategories, key]);
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
              onClick={() => toggleCategory(c.key)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                cursor: "pointer",
              }}
            >
              <span>{c.label}</span>
              {isActive}
            </div>
          ),
        };
      })}
    />
  );
}
