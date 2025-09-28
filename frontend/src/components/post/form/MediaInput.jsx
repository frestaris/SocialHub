import { Form, Input, Button, Upload as AntUpload, Switch } from "antd";
import { UploadOutlined, LinkOutlined } from "@ant-design/icons";

export default function MediaInput({ useUpload, setUseUpload }) {
  return (
    <Form.Item label="Media">
      <div style={{ marginBottom: 12 }}>
        <Switch
          checked={useUpload}
          onChange={setUseUpload}
          checkedChildren="Upload"
          unCheckedChildren="URL"
        />
      </div>

      {!useUpload ? (
        <Form.Item name="mediaUrl">
          <Input
            prefix={<LinkOutlined />}
            placeholder="Paste image / video URL"
          />
        </Form.Item>
      ) : (
        <Form.Item
          name="mediaFile"
          valuePropName="fileList"
          getValueFromEvent={(e) => e?.fileList}
        >
          <AntUpload
            accept="image/*,video/*"
            maxCount={1}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Upload Image/Video</Button>
          </AntUpload>
        </Form.Item>
      )}
    </Form.Item>
  );
}
