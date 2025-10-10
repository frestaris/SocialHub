import { useState } from "react";

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
import { uploadToFirebase } from "../../../utils/firebase/uploadToFirebase";
import { auth } from "../../../firebase";

// --- Utils ---
import { handleError, handleSuccess } from "../../../utils/handleMessage";
import CoverPreview from "./CoverPreview";

export default function CoverEdit({ cover, isOwner }) {
  // --- Local state ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [action, setAction] = useState(""); // "saving" | "removing" | ""

  const [hover, setHover] = useState(false);
  const [coverOffset, setCoverOffset] = useState(0);

  const [previewSrc, setPreviewSrc] = useState(null);
  const [localFile, setLocalFile] = useState(null);

  // --- Redux mutation ---
  const [updateUser] = useUpdateUserMutation();

  // --- AntD form for URL input ---
  const [form] = Form.useForm();

  // --- Handle Upload from PC ---
  const handleBeforeUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      handleError({ message: "Only image files are allowed!" });
      return false;
    }
    if (file.size / 1024 / 1024 > 4) {
      handleError({ message: "Cover must be smaller than 4MB!" });
      return false;
    }

    const localUrl = URL.createObjectURL(file);
    setLocalFile(file);
    setPreviewSrc(localUrl);
    setIsModalOpen(true);

    return false; // prevent auto-upload
  };

  // --- Handle Confirm (save cover) ---
  const handleConfirm = async () => {
    try {
      setAction("saving");
      setIsFinalizing(true);

      let finalUrl = previewSrc;

      // If file upload, push to Firebase first
      if (localFile) {
        setIsFinalizing(false);
        finalUrl = await uploadToFirebase(
          localFile,
          auth.currentUser.uid,
          (progress) => setCoverProgress(progress),
          "covers"
        );
      }
      setIsFinalizing(true);
      await updateUser({ cover: finalUrl, coverOffset }).unwrap();

      handleSuccess("Cover photo updated!");

      // Reset state
      setIsModalOpen(false);
      setPreviewSrc(null);
      setLocalFile(null);
      setCoverProgress(0);
      form.resetFields();
    } catch (err) {
      handleError(err, "Failed to save cover");
    } finally {
      setIsFinalizing(false);
      setAction("");
    }
  };

  // --- Remove cover ---
  const handleRemoveCover = async () => {
    try {
      setAction("removing");
      setIsFinalizing(true);
      await updateUser({ cover: "" }).unwrap();
      handleSuccess("Cover photo removed!");

      setPreviewSrc(null);
      setLocalFile(null);
    } catch (err) {
      handleError(err, "Failed to remove cover");
    } finally {
      setIsFinalizing(false);
      setAction("");
    }
  };

  // --- Dropdown Menu ---
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
        onClick: () => setIsModalOpen(true),
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
          {isFinalizing && action === "removing"
            ? "Removing..."
            : cover
            ? "Edit Cover Photo"
            : "Add Cover Photo"}
        </Button>
      </Dropdown>

      {/* --- Hidden Upload Input --- */}
      <AntUpload
        id="coverUploadInput"
        beforeUpload={handleBeforeUpload}
        showUploadList={false}
        accept="image/*"
        style={{ display: "none" }}
      >
        <span />
      </AntUpload>

      {/* --- (URL + Upload Preview) --- */}
      <Modal
        title="Adjust Cover Photo"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setPreviewSrc(null);
          setLocalFile(null);
          form.resetFields();
        }}
        onOk={handleConfirm}
        okButtonProps={{
          loading: coverProgress > 0 || isFinalizing,
        }}
        width={600}
        okText={
          coverProgress > 0 && coverProgress < 100
            ? `Uploading... ${Math.round(coverProgress)}%`
            : isFinalizing
            ? "Finalizing..."
            : "Save"
        }
      >
        <Form form={form} layout="vertical">
          {!localFile && (
            <Form.Item
              name="url"
              rules={[{ type: "url", message: "Invalid URL" }]}
            >
              <Input
                prefix={<LinkOutlined />}
                placeholder="https://example.com/image.jpg"
                disabled={isFinalizing}
                onChange={(e) => setPreviewSrc(e.target.value)}
              />
            </Form.Item>
          )}
        </Form>

        {previewSrc && (
          <CoverPreview src={previewSrc} onOffsetChange={setCoverOffset} />
        )}
      </Modal>
    </>
  );
}
