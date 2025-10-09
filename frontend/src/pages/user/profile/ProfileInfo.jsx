import { useState, useMemo, useRef } from "react";

// --- Ant Design ---
import { Card, Avatar, Typography, Button, Space, Tooltip } from "antd";
import { SendOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";

// --- Redux ---
import { useSelector, useDispatch } from "react-redux";

// --- Components ---
import SettingsModal from "../settings/SettingsModal";
import Upload from "../../../components/post/Upload";
import FollowButton from "../../../components/FollowButton";
import CoverEdit from "./CoverEdit";
import AvatarEdit from "./AvatarEdit";
import moment from "../../../utils/momentShort";

// --- Chat ---
import { useStartConversationMutation } from "../../../redux/chat/chatApi";
import { chatSocketHelpers } from "../../../utils/useChatSocket";
import { handleError } from "../../../utils/handleMessage";
import { setActiveConversation } from "../../../redux/chat/chatSlice";

const { Title, Paragraph, Text } = Typography;

export default function ProfileInfo({ user }) {
  // --- Redux state ---
  const currentUser = useSelector((state) => state.auth.user);
  const isOwner = currentUser && user && currentUser._id === user._id;
  const dispatch = useDispatch();

  // --- Local state ---
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const bioRef = useRef(null);

  // --- Chat setup ---
  const [startConversation] = useStartConversationMutation();

  // Start or open chat with this user
  const handleStartChat = async () => {
    try {
      const res = await startConversation(user._id).unwrap();
      if (res.success && res.conversation?._id) {
        // Join socket room
        chatSocketHelpers.joinConversation(res.conversation._id);

        // Mark active conversation in Redux
        dispatch(setActiveConversation(res.conversation._id));

        // Tell ChatDock to open this conversation window
        window.dispatchEvent(
          new CustomEvent("openChatFromProfile", {
            detail: {
              conversation: res.conversation,
            },
          })
        );
      } else {
        handleError(res.error || "Could not start chat");
      }
    } catch (err) {
      handleError(err?.data?.error || "Something went wrong starting chat");
    }
  };

  // --- Derived state ---
  const isFollowingUser = useMemo(() => {
    if (!currentUser || !user) return false;
    return user.followers?.some((f) => f._id === currentUser._id);
  }, [user, currentUser]);

  const bio = user?.bio || "";

  return (
    <>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
          padding: 0,
          maxHeight: 400,
          overflowY: "auto",
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Cover image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 140,
            overflow: "hidden",
            background: "#f0f0f0",
          }}
        >
          {user?.cover && user.cover.trim() !== "" ? (
            <img
              src={user.cover}
              alt="Cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `center ${user.coverOffset || 0}%`,
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(135deg, #0F172A, #1E3A8A, #22D3EE)",
              }}
            />
          )}

          {/* Cover Editor for owner */}
          <CoverEdit cover={user?.cover} isOwner={isOwner} />

          {/* Settings button (owner only) */}
          {isOwner && (
            <Button
              type="text"
              shape="circle"
              icon={<SettingOutlined style={{ fontSize: 22, color: "#fff" }} />}
              onClick={() => setIsSettingsModalOpen(true)}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: hover ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)",
                transition: "background 0.2s ease",
              }}
            />
          )}
        </div>

        {/* Avatar + user info */}
        <div
          style={{
            textAlign: "center",
            marginTop: -48,
            padding: "0 16px 16px",
            position: "relative",
          }}
        >
          <div style={{ position: "relative", display: "inline-block" }}>
            {/* Avatar */}
            <Avatar
              src={
                user.avatar && user.avatar.trim() !== "" ? user.avatar : null
              }
              icon={
                !user.avatar || user.avatar.trim() === "" ? (
                  <UserOutlined />
                ) : null
              }
              size={96}
              style={{
                border: "3px solid #fff",
                background: "#cecece",
              }}
            />

            {/* Overlay progress text */}
            {(avatarProgress > 0 && avatarProgress < 100) ||
            avatarProgress === 100 ? (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#fff",
                  fontWeight: "bold",
                  background: "rgba(0,0,0,0.5)",
                  padding: "2px 6px",
                  borderRadius: "8px",
                  fontSize: 14,
                }}
              >
                {avatarProgress > 0 && avatarProgress < 100
                  ? `${Math.round(avatarProgress)}%`
                  : "Finalizing..."}
              </div>
            ) : null}

            {/* Camera / edit button */}
            <AvatarEdit
              avatar={user?.avatar}
              isOwner={isOwner}
              onProgress={(p) => {
                setAvatarProgress(p);
              }}
            />
          </div>

          <Title level={3} style={{ marginTop: 8 }}>
            {user?.username}
          </Title>
          <Text type="secondary">
            Member since {moment(user?.createdAt).format("MMM YYYY")}
          </Text>

          {/* --- Bio with expand/collapse --- */}
          {bio && (
            <div style={{ marginTop: 24, textAlign: "left" }}>
              <div
                ref={bioRef}
                style={{
                  maxHeight: expanded ? bioRef.current?.scrollHeight : 25,
                  overflow: "hidden",
                  transition: "max-height 0.5s ease",
                }}
              >
                <Paragraph style={{ whiteSpace: "pre-line" }}>{bio}</Paragraph>
              </div>

              {bio.length > 120 && (
                <Button
                  type="link"
                  size="small"
                  style={{ padding: 0 }}
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  {expanded ? "Show Less" : "Show More"}
                </Button>
              )}
            </div>
          )}

          {/* --- Buttons Section --- */}
          <Space direction="vertical" style={{ width: "100%", marginTop: 12 }}>
            {!isOwner && (
              <FollowButton
                userId={user._id}
                isFollowing={isFollowingUser}
                isOwner={isOwner}
                block
              />
            )}

            {/* Message Button */}
            {!isOwner && isFollowingUser && (
              <Tooltip title="Send a Message" placement="top">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined style={{ fontSize: 18 }} />}
                  onClick={handleStartChat}
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#1677ff",
                    boxShadow: "0 4px 10px rgba(22,119,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.25s ease",
                    transform: "rotate(-15deg) scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "rotate(-15deg) scale(1.1)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 14px rgba(22,119,255,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotate(-15deg) scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 10px rgba(22,119,255,0.3)";
                  }}
                />
              </Tooltip>
            )}

            {isOwner && (
              <Button
                type="primary"
                block
                onClick={() => setIsUploadModalOpen(true)}
              >
                Post
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Modals */}
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
      />
      <Upload
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}
