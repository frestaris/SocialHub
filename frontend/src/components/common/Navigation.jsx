import { useState } from "react";

// --- Ant Design ---
import {
  Layout,
  Menu,
  Button,
  Drawer,
  Grid,
  Avatar,
  Dropdown,
  Space,
  Badge,
} from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  PlusOutlined,
  CompassOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.png";

// --- Routing & Redux ---
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/auth/authSlice";

// --- Local components/hooks ---
import SettingsModal from "../../pages/user/settings/SettingsModal";
import Upload from "../post/modals/Upload";
import SearchBar from "./SearchBar";
import NotificationsDropdown from "../notification/NotificationsDropdown";
import NotificationsDrawer from "../notification/NotificationsDrawer";
import useSearchHandler from "../../hooks/useSearchHandler";

const { Header } = Layout;
const { useBreakpoint } = Grid;

export default function Navigation() {
  // --- Local UI state ---
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // --- Responsive breakpoints ---
  const screens = useBreakpoint();

  // --- Router + Redux ---
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- Global state ---
  const currentUser = useSelector((state) => state.auth.user);

  // --- Custom hooks ---
  const { inputValue, setInputValue, handleSearch } = useSearchHandler();

  // --- Helpers ---
  const handleLogout = () => {
    dispatch(logout());
    navigate("/explore");
  };

  const handleNavigate = (path, close = true) => {
    navigate(path);
    if (close) setDrawerOpen(false);
  };
  const unreadCount = Object.values(
    useSelector((s) => s.chat.unread) || {}
  ).filter((c) => c > 0).length;

  // --- Avatar dropdown menu ---
  const avatarMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
        onClick: () => handleNavigate(`/profile/${currentUser._id}`, false),
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
        onClick: () => setSettingsOpen(true),
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          padding: "0 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <div
          onClick={() => {
            navigate("/");
            window.dispatchEvent(new CustomEvent("closeAllChats"));
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <img
            src={logo}
            alt="Social Hub Logo"
            style={{
              width: 36,
              height: 36,
              objectFit: "contain",
              marginTop: -2,
            }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: 22,
              color: "#0F172A",
            }}
          >
            Social Hub
          </span>
        </div>

        {/* SearchBar (desktop only) */}
        {screens.sm && (
          <div style={{ flex: 1, maxWidth: 500, margin: "0 16px" }}>
            <SearchBar
              value={inputValue}
              onChange={setInputValue}
              onSearch={handleSearch}
            />
          </div>
        )}

        {/* Right section */}
        {!screens.md ? (
          // ----- MOBILE -----
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Chat button icon (mobile) */}
            <Badge
              count={unreadCount}
              overflowCount={9}
              size="small"
              offset={[-4, 4]}
            >
              <Button
                type="text"
                icon={
                  <MessageOutlined
                    style={{
                      fontSize: 20,
                      position: "relative",
                      top: -2,
                    }}
                  />
                }
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("toggleChatList"))
                }
              />
            </Badge>
            <NotificationsDrawer />
            {/* Hamburger menu */}
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
            />
          </div>
        ) : (
          // ----- DESKTOP -----
          <div style={{ display: "flex", alignItems: "center" }}>
            <Menu
              mode="horizontal"
              selectable={false}
              style={{ borderBottom: "none", marginRight: "16px" }}
              items={[
                {
                  key: "explore",
                  label: (
                    <Link to="/explore">
                      <CompassOutlined style={{ marginRight: 6 }} />
                      Explore
                    </Link>
                  ),
                },
              ]}
            />

            {currentUser ? (
              <Space size="middle" align="center">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setUploadOpen(true)}
                >
                  Post
                </Button>

                {/* --- Desktop notifications --- */}
                <NotificationsDropdown />

                <Dropdown menu={avatarMenu} placement="bottomRight">
                  <Avatar
                    src={currentUser?.avatar || null}
                    icon={!currentUser?.avatar && <UserOutlined />}
                    size={36}
                    style={{ cursor: "pointer" }}
                  />
                </Dropdown>
              </Space>
            ) : (
              <Button type="primary" onClick={() => handleNavigate("/login")}>
                Login
              </Button>
            )}
          </div>
        )}
      </Header>

      {/* Drawer (mobile main menu) */}
      <Drawer
        title="Social Hub"
        placement="right"
        closable
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {/* SearchBar inside drawer */}
        <div style={{ marginBottom: 16 }}>
          <SearchBar
            value={inputValue}
            onChange={setInputValue}
            onSearch={(val) => {
              handleSearch(val);
              setDrawerOpen(false);
            }}
          />
        </div>

        <Menu
          mode="vertical"
          selectable={false}
          onClick={() => handleNavigate("/explore")}
          style={{ textAlign: "center" }}
          items={[
            {
              key: "explore",
              icon: <CompassOutlined />,
              label: "Explore",
            },
          ]}
        />

        <div style={{ marginTop: "16px" }}>
          {!currentUser ? (
            <Button
              type="primary"
              block
              onClick={() => handleNavigate("/login")}
            >
              Login
            </Button>
          ) : (
            <>
              <Button
                type="primary"
                block
                icon={<PlusOutlined />}
                onClick={() => {
                  setUploadOpen(true);
                  setDrawerOpen(false);
                }}
                style={{ marginBottom: "8px" }}
              >
                Post
              </Button>

              <Button
                block
                icon={<UserOutlined />}
                onClick={() => handleNavigate(`/profile/${currentUser._id}`)}
                style={{ marginTop: "8px" }}
              >
                Profile
              </Button>

              <Button
                block
                icon={<SettingOutlined />}
                onClick={() => {
                  setSettingsOpen(true);
                  setDrawerOpen(false);
                }}
                style={{ marginTop: "8px" }}
              >
                Settings
              </Button>

              <Button
                danger
                block
                style={{ marginTop: "8px" }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </Drawer>

      {/* Modals (only when logged in) */}
      {currentUser && (
        <>
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            user={currentUser}
          />
          <Upload open={uploadOpen} onClose={() => setUploadOpen(false)} />
        </>
      )}
    </>
  );
}
