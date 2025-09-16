import { useState } from "react";
import {
  Form,
  Input,
  Space,
  Switch,
  Upload as AntUpload,
  Button,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function ProfileInfoForm() {
  const [useFile, setUseFile] = useState(false);

  return (
    <>
      <Form.Item
        label="Username"
        name="username"
        rules={[{ required: true, message: "Please enter a username" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Bio" name="bio">
        <Input.TextArea rows={1} />
      </Form.Item>

      {/* Avatar toggle */}
      <Form.Item label="Avatar Source">
        <Space>
          <span>URL</span>
          <Switch checked={useFile} onChange={(val) => setUseFile(val)} />
          <span>File</span>
        </Space>
      </Form.Item>

      {/* Conditionally render URL input or file upload */}
      {!useFile ? (
        <Form.Item label="Avatar URL" name="avatar">
          <Input placeholder="https://example.com/avatar.png" />
        </Form.Item>
      ) : (
        <Form.Item
          label="Upload Avatar"
          name="avatarFile"
          valuePropName="fileList"
          getValueFromEvent={(e) => e && e.fileList}
        >
          <AntUpload
            accept="image/*"
            beforeUpload={(file) => {
              const isUnder4MB = file.size / 1024 / 1024 < 4;
              if (!isUnder4MB) {
                message.error("Avatar must be smaller than 4MB!");
                return AntUpload.LIST_IGNORE;
              }
              return false; // ✅ prevent auto-upload
            }}
            listType="picture"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Select Avatar</Button>
          </AntUpload>
        </Form.Item>
      )}
    </>
  );
}
