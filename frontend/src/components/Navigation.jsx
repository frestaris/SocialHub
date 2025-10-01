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
} from "antd";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ProfileOutlined,
  PlusOutlined,
} from "@ant-design/icons";

// --- Routing & Redux ---
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth/authSlice";

// --- Local components/hooks ---
import SettingsModal from "../pages/user/settings/SettingsModal";
import Upload from "./post/Upload";
import SearchBar from "./SearchBar";
import NotificationsDropdown from "./notification/NotificationsDropdown";
import NotificationsDrawer from "./notification/NotificationsDrawer";
import useSearchHandler from "../hooks/useSearchHandler";

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

  // --- Avatar dropdown menu ---
  const avatarMenu = {
    items: [
      {
        key: "profile",
        icon: <ProfileOutlined />,
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
          style={{ fontWeight: "bold", fontSize: "20px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Social Hub
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
        {screens.sm ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Menu
              mode="horizontal"
              selectable={false}
              style={{ borderBottom: "none", marginRight: "16px" }}
              items={[
                { key: "explore", label: <Link to="/explore">Explore</Link> },
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
                    src={
                      currentUser?.avatar
                        ? `${currentUser.avatar}?t=${currentUser._id}`
                        : null
                    }
                    icon={!currentUser?.avatar && <UserOutlined />}
                    size={36}
                    style={{ cursor: "pointer" }}
                  />
                </Dropdown>
              </Space>
            ) : (
              <Button type="primary" onClick={() => handleNavigate("/login")}>
                Become a Creator
              </Button>
            )}
          </div>
        ) : (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
        )}
      </Header>

      {/* Drawer (mobile main menu) */}
      <Drawer
        title="CreatorHub"
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
          items={[{ key: "explore", label: "Explore" }]}
        />

        <div style={{ marginTop: "16px" }}>
          {!currentUser ? (
            <Button
              type="primary"
              block
              onClick={() => handleNavigate("/login")}
            >
              Become a Creator
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

              {/* --- Mobile notifications --- */}
              <div style={{ margin: "12px 0" }}>
                <NotificationsDrawer />
              </div>

              <Button
                block
                onClick={() => handleNavigate(`/profile/${currentUser._id}`)}
                style={{ marginTop: "8px" }}
              >
                Profile
              </Button>
              <Button
                block
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
