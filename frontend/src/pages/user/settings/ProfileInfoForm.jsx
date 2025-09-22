import { useEffect, useState } from "react";
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
  const [useAvatarFile, setUseAvatarFile] = useState(false);
  const [useCoverFile, setUseCoverFile] = useState(false);

  // preview states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // watch form fields
  const avatarUrl = Form.useWatch("avatar", form);
  const coverUrl = Form.useWatch("cover", form);

  // sync preview when modal opens or values change
  useEffect(() => {
    if (avatarUrl && !useAvatarFile) setAvatarPreview(avatarUrl);
  }, [avatarUrl, useAvatarFile]);

  useEffect(() => {
    if (coverUrl && !useCoverFile) setCoverPreview(coverUrl);
  }, [coverUrl, useCoverFile]);

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
              <Switch
                checked={useAvatarFile}
                onChange={(val) => setUseAvatarFile(val)}
              />
              <span>File</span>
            </Space>
          </Form.Item>

          {!useAvatarFile ? (
            <Form.Item label="Avatar URL" name="avatar">
              <Input
                placeholder="https://example.com/avatar.png"
                onChange={(e) => setAvatarPreview(e.target.value)}
              />
            </Form.Item>
          ) : (
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
                return e && e.fileList;
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

          {/* Avatar preview */}
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
              <Switch
                checked={useCoverFile}
                onChange={(val) => setUseCoverFile(val)}
              />
              <span>File</span>
            </Space>
          </Form.Item>

          {!useCoverFile ? (
            <Form.Item label="Cover URL" name="cover">
              <Input
                placeholder="https://example.com/cover.jpg"
                onChange={(e) => setCoverPreview(e.target.value)}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="Upload Cover"
              name="coverFile"
              valuePropName="fileList"
              getValueFromEvent={(e) => e && e.fileList}
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
                onChange={({ fileList }) => {
                  if (fileList.length > 0 && fileList[0].originFileObj) {
                    setCoverPreview(
                      URL.createObjectURL(fileList[0].originFileObj)
                    );
                  } else {
                    setCoverPreview(null);
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>Select Cover</Button>
              </AntUpload>
            </Form.Item>
          )}

          {/* Cover preview */}
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
