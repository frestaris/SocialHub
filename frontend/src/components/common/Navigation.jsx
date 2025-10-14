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
  LoginOutlined,
} from "@ant-design/icons";

// --- Routing & Redux ---
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/auth/authSlice";

import logo from "../../assets/logo.png";
import imageBg from "../../assets/bg-card-1.jpg";

// --- Local components ---
import SettingsModal from "../../pages/user/settings/SettingsModal";
import Upload from "../post/modals/Upload";
import SearchBar from "./SearchBar";
import NotificationsDropdown from "../notification/NotificationsDropdown";
import NotificationsDrawer from "../notification/NotificationsDrawer";
import useSearchHandler from "../../hooks/useSearchHandler";
import GradientButton from "./GradientButton";

const { Header } = Layout;
const { useBreakpoint } = Grid;

/**
 *
 * --------------------------------------
 * Top-level navigation bar of the app.
 *
 * Responsibilities:
 *  Handles navigation across pages (Explore, Profile, etc.)
 *  Integrates search functionality
 *  Displays notifications, messages, and avatar menu
 *  Supports responsive behavior with Drawer for mobile
 */
export default function Navigation() {
  // --- Local UI state ---
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // --- Responsive ---
  const screens = useBreakpoint();

  // --- Routing + Redux ---
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  // --- Custom Hooks ---
  const { inputValue, setInputValue, handleSearch } = useSearchHandler();

  // --- Derived values ---
  const unreadCount = Object.values(
    useSelector((s) => s.chat.unread) || {}
  ).filter((c) => c > 0).length;

  // --- Helper functions ---
  const handleLogout = () => {
    dispatch(logout());
    navigate("/explore");
  };

  const handleNavigate = (path, close = true) => {
    navigate(path);
    if (close) setDrawerOpen(false);
  };

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
      {/*  Sticky Header */}
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
        {/*  Logo */}
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
          <span style={{ fontWeight: 600, fontSize: 22, color: "#0F172A" }}>
            Social
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 18,
              color: "#fff",
              background: "linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)",
              padding: "2px 12px",
              borderRadius: "6px",
              border: "1px solid #3b82f6",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              lineHeight: 1.4,
              height: "fit-content",
              marginTop: 1,
            }}
          >
            Hub
          </span>
        </div>

        {/*  Search (desktop only) */}
        {screens.sm && (
          <div style={{ flex: 1, maxWidth: 500, margin: "0 16px" }}>
            <SearchBar
              value={inputValue}
              onChange={setInputValue}
              onSearch={handleSearch}
            />
          </div>
        )}

        {/*  Right Section */}
        {!screens.md ? (
          // ----- MOBILE -----
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {currentUser && (
              <>
                {/*  Chat toggle */}
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
                        style={{ fontSize: 20, top: -2, position: "relative" }}
                      />
                    }
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent("toggleChatList"))
                    }
                  />
                </Badge>

                {/*  Notifications (drawer) */}
                <NotificationsDrawer />
              </>
            )}

            {/*  Menu button */}
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
                {/*  Create post */}
                <GradientButton
                  icon={<PlusOutlined />}
                  text="Post"
                  onClick={() => setUploadOpen(true)}
                />

                {/* Notifications dropdown */}
                <NotificationsDropdown />

                {/* Avatar menu */}
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
              <GradientButton
                icon={<LoginOutlined style={{ fontSize: 16 }} />}
                text="Login"
                onClick={() => handleNavigate("/login")}
              />
            )}
          </div>
        )}
      </Header>

      {/*  Mobile Drawer */}
      <Drawer
        title="Social Hub"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{
          body: {
            backgroundImage: `linear-gradient(
              rgba(255, 255, 255, 0.94),
              rgba(255, 255, 255, 0.94)
            ), url(${imageBg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            padding: 24,
          },
        }}
      >
        {/*  Search inside drawer */}
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

        {/*  Menu list */}
        <Menu
          mode="vertical"
          selectable={false}
          onClick={() => handleNavigate("/explore")}
          style={{
            textAlign: "center",
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(99, 102, 241, 0.15)",
            boxShadow: "0 2px 6px rgba(59, 130, 246, 0.08)",
          }}
          items={[
            { key: "explore", icon: <CompassOutlined />, label: "Explore" },
          ]}
        />

        {/* Profile / Login actions */}
        <div style={{ marginTop: "16px" }}>
          {!currentUser ? (
            <GradientButton
              icon={<LoginOutlined style={{ fontSize: 16 }} />}
              text="Login"
              onClick={() => handleNavigate("/login")}
              block
            />
          ) : (
            <>
              <GradientButton
                icon={<PlusOutlined />}
                text="Post"
                onClick={() => {
                  setUploadOpen(true);
                  setDrawerOpen(false);
                }}
                style={{ width: "100%", marginBottom: 8 }}
                block
              />

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

      {/* Modals (Settings / Upload) */}
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
