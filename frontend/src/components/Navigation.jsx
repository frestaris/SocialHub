import { useState } from "react";
import { Layout, Menu, Button, Drawer, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Header } = Layout;
const { useBreakpoint } = Grid;

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const menuItems = [
    { key: "explore", label: <Link to="/explore">Explore</Link> },
    { key: "login", label: <Link to="/login">Login</Link> },
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
      {/* Logo (click to go home) */}
      <div
        style={{ fontWeight: "bold", fontSize: "20px", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
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
          <Button type="primary" onClick={() => navigate("/login")}>
            Become a Creator
          </Button>
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
          <Button type="primary" block onClick={() => navigate("/login")}>
            Become a Creator
          </Button>
        </div>
      </Drawer>
    </Header>
  );
}
