import { useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/auth/authSlice";
import SettingsModal from "../pages/user/settings/SettingsModal";
import Upload from "../pages/upload/Upload";

const { Header } = Layout;
const { useBreakpoint } = Grid;

export default function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/explore");
  };

  const avatarMenu = {
    items: [
      {
        key: "profile",
        icon: <ProfileOutlined />,
        label: "Profile",
        onClick: () => navigate(`/profile/${currentUser._id}`),
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
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {/* Logo */}
        <div
          style={{ fontWeight: "bold", fontSize: "20px", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          CreatorHub
        </div>

        {/* Right section */}
        {screens.sm ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* Menu */}
            <Menu
              mode="horizontal"
              selectable={false}
              style={{ borderBottom: "none", marginRight: "16px" }}
              items={[
                { key: "explore", label: <Link to="/explore">Explore</Link> },
              ]}
            />

            {/* Auth / Post controls */}
            {currentUser ? (
              <>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setUploadOpen(true)}
                  style={{ marginRight: "16px" }}
                >
                  Post
                </Button>

                <Dropdown menu={avatarMenu} placement="bottomRight">
                  <Space style={{ cursor: "pointer" }}>
                    <Avatar
                      src={
                        currentUser?.avatar
                          ? `${currentUser.avatar}?t=${currentUser._id}`
                          : null
                      }
                      icon={!currentUser?.avatar && <UserOutlined />}
                    />
                  </Space>
                </Dropdown>
              </>
            ) : (
              <Button type="primary" onClick={() => navigate("/login")}>
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

        {/* Drawer (mobile) */}
        <Drawer
          title="CreatorHub"
          placement="right"
          closable
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
        >
          <Menu
            mode="vertical"
            selectable={false}
            items={[
              { key: "explore", label: <Link to="/explore">Explore</Link> },
            ]}
          />

          <div style={{ marginTop: "16px" }}>
            {!currentUser ? (
              <Button
                type="primary"
                block
                onClick={() => {
                  navigate("/login");
                  setDrawerOpen(false);
                }}
              >
                Become a Creator
              </Button>
            ) : (
              <>
                {/* + Post button at top */}
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
                  onClick={() => {
                    navigate(`/profile/${currentUser._id}`);
                    setDrawerOpen(false);
                  }}
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
      </Header>

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
