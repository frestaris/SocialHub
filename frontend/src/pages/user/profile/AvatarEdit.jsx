import { useState, useEffect } from "react";

// --- Ant Design ---
import {
  Button,
  Dropdown,
  Modal,
  Input,
  Upload as AntUpload,
  Form,
} from "antd";

// --- Ant Design Icons ---
import {
  UploadOutlined,
  LinkOutlined,
  DeleteOutlined,
  CameraOutlined,
} from "@ant-design/icons";

// --- Redux ---
import { useUpdateUserMutation } from "../../../redux/user/userApi";

// --- Firebase ---
import { uploadToFirebase } from "../../../utils/firebase/uploadToFirebase";
import { auth } from "../../../firebase";

// --- Utils ---
import { handleError, handleSuccess } from "../../../utils/handleMessage";

export default function AvatarEdit({ avatar, isOwner, onProgress }) {
  // --- Local state ---
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [hover, setHover] = useState(false);

  // --- Redux mutation ---
  const [updateUser] = useUpdateUserMutation();

  // --- AntD form for URL input ---
  const [form] = Form.useForm();
  const urlValue = Form.useWatch("url", form);

  // --- Reset URL input when modal opens (always empty) ---
  useEffect(() => {
    if (isUrlModalOpen) {
      form.setFieldsValue({ url: "" });
    }
  }, [isUrlModalOpen, form]);

  // Handlers

  // Upload from PC
  const handleAvatarUpload = async (file) => {
    try {
      if (!file.type.startsWith("image/")) {
        handleError({ message: "Only image files are allowed!" });
        return false;
      }
      if (file.size / 1024 / 1024 > 4) {
        handleError({ message: "Avatar must be smaller than 4MB!" });
        return false;
      }

      setAvatarProgress(0);
      setIsFinalizing(false);

      const url = await uploadToFirebase(
        file,
        auth.currentUser.uid,
        (progress) => {
          setAvatarProgress(progress);
          if (onProgress) {
            onProgress(progress);
          }
        },
        "avatars"
      );

      setIsFinalizing(true);
      await updateUser({ avatar: url }).unwrap();

      handleSuccess("Avatar updated!");

      setAvatarProgress(0);
      if (onProgress) onProgress(0);
      setIsFinalizing(false);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      if (onProgress) onProgress(0);
      setIsFinalizing(false);
    }
    return false;
  };

  // Update via URL
  const handleAvatarUrl = async () => {
    try {
      const { url } = form.getFieldsValue();
      if (!url) return;

      setIsFinalizing(true);
      await updateUser({ avatar: url }).unwrap();

      handleSuccess("Avatar updated!");
      setIsUrlModalOpen(false);
    } catch (err) {
      handleError(err, "Failed to update avatar");
    } finally {
      setIsFinalizing(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    try {
      setIsFinalizing(true);
      await updateUser({ avatar: "" }).unwrap();

      handleSuccess("Avatar removed!");
    } catch (err) {
      handleError(err, "Failed to remove avatar");
    } finally {
      setIsFinalizing(false);
    }
  };

  // Dropdown Menu
  const avatarMenu = {
    items: [
      {
        key: "upload",
        label: "Upload",
        icon: <UploadOutlined />,
        onClick: () => document.getElementById("avatarUploadInput").click(),
      },
      {
        key: "url",
        label: "From URL",
        icon: <LinkOutlined />,
        onClick: () => setIsUrlModalOpen(true),
      },
      ...(avatar
        ? [
            {
              key: "remove",
              label: "Remove Avatar",
              icon: <DeleteOutlined />,
              danger: true,
              onClick: handleRemoveAvatar,
            },
          ]
        : []),
    ],
  };

  if (!isOwner) return null;

  // Render
  return (
    <>
      {/* Avatar Action Button */}
      <Dropdown
        menu={avatarMenu}
        trigger={["click"]}
        placement="bottomRight"
        disabled={avatarProgress > 0}
      >
        <Button
          shape="circle"
          icon={<CameraOutlined style={{ fontSize: 18, color: "#fff" }} />}
          size="small"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            position: "absolute",
            bottom: -5,
            right: 5,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            padding: 0,
            lineHeight: 0,
            background: hover ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)",
            transition: "background 0.2s ease",
          }}
        />
      </Dropdown>

      {/* Hidden Upload */}
      <AntUpload
        id="avatarUploadInput"
        beforeUpload={handleAvatarUpload}
        showUploadList={false}
        accept="image/*"
        style={{ display: "none" }}
      >
        <span />
      </AntUpload>

      {/* URL Modal */}
      <Modal
        title="Enter Avatar URL"
        open={isUrlModalOpen}
        onCancel={() => setIsUrlModalOpen(false)}
        onOk={handleAvatarUrl}
        okButtonProps={{ loading: isFinalizing }}
      >
        <Form form={form} layout="vertical">
          {/* URL Input */}
          <Form.Item
            name="url"
            rules={[{ type: "url", message: "Invalid URL" }]}
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="https://example.com/avatar.jpg"
              disabled={isFinalizing}
            />
          </Form.Item>

          {/* Preview */}
          {urlValue && (
            <div
              style={{
                marginTop: 12,
                width: 100,
                height: 100,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginInline: "auto",
              }}
            >
              <img
                src={urlValue}
                alt="Avatar preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.currentTarget.src = "";
                }}
              />
            </div>
          )}
        </Form>
      </Modal>
    </>
  );
}
