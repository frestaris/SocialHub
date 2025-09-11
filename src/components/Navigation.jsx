import { useState } from "react";
import { Layout, Menu, Button, Drawer, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { useBreakpoint } = Grid;

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();

  const menuItems = [
    { key: "explore", label: "Explore" },
    { key: "login", label: "Login" },
  ];

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Logo */}
      <div style={{ fontWeight: "bold", fontSize: "20px", cursor: "pointer" }}>
        CreatorHub
      </div>

      {/* Show full menu only on large screens */}
      {screens.sm ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Menu
            mode="horizontal"
            items={menuItems}
            selectable={false}
            style={{ borderBottom: "none", marginRight: "16px" }}
          />
          <Button type="primary">Become a Creator</Button>
        </div>
      ) : (
        // Hamburger for md and below
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setOpen(true)}
        />
      )}

      {/* Drawer for mobile/medium */}
      <Drawer
        title="CreatorHub"
        placement="right"
        closable
        onClose={() => setOpen(false)}
        open={open}
      >
        <Menu mode="vertical" items={menuItems} selectable={false} />
        <div style={{ marginTop: "16px" }}>
          <Button type="primary" block>
            Become a Creator
          </Button>
        </div>
      </Drawer>
    </Header>
  );
}
