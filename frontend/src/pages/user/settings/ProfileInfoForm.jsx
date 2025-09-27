import { useEffect, useState } from "react";

// --- Ant Design ---
import {
  Form,
  Input,
  Space,
  Switch,
  Upload as AntUpload,
  Button,
  message,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function ProfileInfoForm({ form }) {
  // --- Local state for toggling between URL vs File ---
  const [useAvatarFile, setUseAvatarFile] = useState(false);
  const [useCoverFile, setUseCoverFile] = useState(false);

  // --- Preview states for image previews ---
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // --- Watch form fields for URLs ---
  const avatarUrl = Form.useWatch("avatar", form);
  const coverUrl = Form.useWatch("cover", form);

  // Preload previews when editing profile (URL-based avatar/cover).
  useEffect(() => {
    if (avatarUrl && !useAvatarFile) setAvatarPreview(avatarUrl);
    if (coverUrl && !useCoverFile) setCoverPreview(coverUrl);
  }, [avatarUrl, coverUrl, useAvatarFile, useCoverFile]);

  //Cleanup blob URLs when component unmounts Prevents memory leaks from object URLs.
  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:"))
        URL.revokeObjectURL(avatarPreview);
      if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [avatarPreview, coverPreview]);

  return (
    <>
      {/* Username */}
      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please enter a username" }]}
      >
        <Input />
      </Form.Item>

      {/* Bio */}
      <Form.Item label="Bio" name="bio">
        <Input.TextArea rows={1} />
      </Form.Item>

      {/* Avatar + Cover side by side */}
      <Row gutter={16}>
        {/* Avatar Column */}
        <Col xs={24} md={12}>
          <Form.Item label="Avatar Source">
            <Space>
              <span>URL</span>
              <Switch checked={useAvatarFile} onChange={setUseAvatarFile} />
              <span>File</span>
            </Space>
          </Form.Item>

          {/* Avatar URL Mode */}
          {!useAvatarFile ? (
            <Form.Item label="Avatar URL" name="avatar">
              <Input
                placeholder="https://example.com/avatar.png"
                onChange={(e) => setAvatarPreview(e.target.value)}
              />
            </Form.Item>
          ) : (
            // Avatar File Mode
            <Form.Item
              label="Upload Avatar"
              name="avatarFile"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (e && e.fileList.length > 0) {
                  const file = e.fileList[0].originFileObj;
                  if (file) setAvatarPreview(URL.createObjectURL(file));
                } else {
                  setAvatarPreview(null);
                }
                return e?.fileList;
              }}
            >
              <AntUpload
                accept="image/*"
                beforeUpload={(file) => {
                  const isUnder4MB = file.size / 1024 / 1024 < 4;
                  if (!isUnder4MB) {
                    message.error("Avatar must be smaller than 4MB!");
                    return AntUpload.LIST_IGNORE;
                  }
                  return false;
                }}
                listType="picture"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Select Avatar</Button>
              </AntUpload>
            </Form.Item>
          )}

          {/* Avatar Preview */}
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                marginTop: 8,
                objectFit: "cover",
                border: "2px solid #ddd",
              }}
            />
          )}
        </Col>

        {/* Cover Column */}
        <Col xs={24} md={12}>
          <Form.Item label="Cover Source">
            <Space>
              <span>URL</span>
              <Switch checked={useCoverFile} onChange={setUseCoverFile} />
              <span>File</span>
            </Space>
          </Form.Item>

          {/* Cover URL Mode */}
          {!useCoverFile ? (
            <Form.Item label="Cover URL" name="cover">
              <Input
                placeholder="https://example.com/cover.jpg"
                onChange={(e) => setCoverPreview(e.target.value)}
              />
            </Form.Item>
          ) : (
            // Cover File Mode
            <Form.Item
              label="Upload Cover"
              name="coverFile"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (e && e.fileList.length > 0) {
                  const file = e.fileList[0].originFileObj;
                  if (file) setCoverPreview(URL.createObjectURL(file));
                } else {
                  setCoverPreview(null);
                }
                return e?.fileList;
              }}
            >
              <AntUpload
                accept="image/*"
                beforeUpload={(file) => {
                  const isUnder4MB = file.size / 1024 / 1024 < 4;
                  if (!isUnder4MB) {
                    message.error("Cover must be smaller than 4MB!");
                    return AntUpload.LIST_IGNORE;
                  }
                  return false;
                }}
                listType="picture"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Select Cover</Button>
              </AntUpload>
            </Form.Item>
          )}

          {/* Cover Preview */}
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover Preview"
              style={{
                width: "100%",
                height: 80,
                borderRadius: "6px",
                marginTop: 8,
                objectFit: "cover",
                border: "2px solid #ddd",
              }}
            />
          )}
        </Col>
      </Row>
    </>
  );
}
