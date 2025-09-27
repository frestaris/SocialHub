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
} from "@ant-design/icons";

// --- Redux ---
import { useUpdateUserMutation } from "../../../redux/user/userApi";

// --- Firebase ---
import { uploadToFirebase } from "../../../utils/uploadToFirebase";
import { auth } from "../../../firebase";

// --- Utils ---
import { handleError, handleSuccess } from "../../../utils/handleMessage";
import CoverPreview from "./CoverPreview";

export default function CoverEdit({ cover, isOwner }) {
  // --- Local state ---
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [hover, setHover] = useState(false);
  const [coverOffset, setCoverOffset] = useState(0);

  // --- Redux mutation ---
  const [updateUser] = useUpdateUserMutation();

  // --- AntD form for URL input ---
  const [form] = Form.useForm();
  const urlValue = Form.useWatch("url", form);

  // --- Reset URL input when modal opens ---
  useEffect(() => {
    if (isUrlModalOpen) {
      form.setFieldsValue({ url: "" });
    }
  }, [isUrlModalOpen, form]);

  // Handlers

  // --- Upload from PC ---
  const handleCoverUpload = async (file) => {
    try {
      if (!file.type.startsWith("image/")) {
        handleError({ message: "Only image files are allowed!" });
        return false;
      }
      if (file.size / 1024 / 1024 > 4) {
        handleError({ message: "Cover must be smaller than 4MB!" });
        return false;
      }

      setCoverProgress(0);
      setIsFinalizing(false);

      // Upload to Firebase
      const url = await uploadToFirebase(
        file,
        auth.currentUser.uid,
        (progress) => setCoverProgress(progress),
        "covers"
      );

      // Finalize after upload
      setIsFinalizing(true);
      await updateUser({ cover: url, coverOffset }).unwrap();

      handleSuccess("Cover photo updated!");
      setCoverProgress(0);
      setIsFinalizing(false);
    } catch (err) {
      handleError(err, "Failed to upload cover");
      setCoverProgress(0);
      setIsFinalizing(false);
    }
    return false; // prevent AntD auto-upload
  };

  // --- Update via URL ---
  const handleCoverUrl = async () => {
    try {
      const { url } = form.getFieldsValue();
      if (!url) return;

      setIsFinalizing(true);
      await updateUser({ cover: url, coverOffset }).unwrap();

      handleSuccess("Cover photo updated!");
      setIsUrlModalOpen(false);
    } catch (err) {
      handleError(err, "Failed to update cover");
    } finally {
      setIsFinalizing(false);
    }
  };

  // --- Remove cover (reset to gradient) ---
  const handleRemoveCover = async () => {
    try {
      setIsFinalizing(true);
      await updateUser({ cover: "" }).unwrap();

      handleSuccess("Cover photo removed!");
    } catch (err) {
      handleError(err, "Failed to remove cover");
    } finally {
      setIsFinalizing(false);
    }
  };

  // Dropdown Menu

  const coverMenu = {
    items: [
      {
        key: "upload",
        label: "Upload",
        icon: <UploadOutlined />,
        onClick: () => document.getElementById("coverUploadInput").click(),
      },
      {
        key: "url",
        label: "From URL",
        icon: <LinkOutlined />,
        onClick: () => setIsUrlModalOpen(true),
      },
      ...(cover
        ? [
            {
              key: "remove",
              label: "Remove Cover",
              icon: <DeleteOutlined />,
              danger: true,
              onClick: handleRemoveCover,
            },
          ]
        : []),
    ],
  };

  // Render

  if (!isOwner) return null;

  return (
    <>
      {/* --- Cover action button --- */}
      <Dropdown
        menu={coverMenu}
        trigger={["click"]}
        placement="bottomRight"
        disabled={coverProgress > 0}
      >
        <Button
          size="small"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            borderRadius: "999px",
            color: "#fff",
            border: "none",
            background: hover ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)",
            transition: "background 0.2s ease",
          }}
        >
          {coverProgress > 0 && coverProgress < 100
            ? `Uploading... ${Math.round(coverProgress)}%`
            : isFinalizing
            ? "Finalizing..."
            : cover
            ? "Edit Cover Photo"
            : "Add Cover Photo"}
        </Button>
      </Dropdown>

      {/* --- Hidden Upload --- */}
      <AntUpload
        id="coverUploadInput"
        beforeUpload={handleCoverUpload}
        showUploadList={false}
        accept="image/*"
        style={{ display: "none" }}
      >
        <span />
      </AntUpload>

      {/* --- URL Modal --- */}
      <Modal
        title="Enter Cover Photo URL"
        open={isUrlModalOpen}
        onCancel={() => setIsUrlModalOpen(false)}
        onOk={handleCoverUrl}
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
              placeholder="https://example.com/image.jpg"
              disabled={isFinalizing}
            />
          </Form.Item>

          {/* Preview */}
          {urlValue && (
            <CoverPreview src={urlValue} onOffsetChange={setCoverOffset} />
          )}
        </Form>
      </Modal>
    </>
  );
}
