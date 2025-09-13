import { Form, Input, Button, Upload as AntUpload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

export default function UploadVideoForm() {
  return (
    <Form layout="vertical">
      <Form.Item label="Title" name="title" rules={[{ required: true }]}>
        <Input placeholder="Enter video title" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <TextArea rows={4} placeholder="Write a description..." />
      </Form.Item>

      <Form.Item label="Category" name="category">
        <Select placeholder="Select category">
          <Option value="gaming">Gaming</Option>
          <Option value="music">Music</Option>
          <Option value="art">Art</Option>
          <Option value="fitness">Fitness</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Upload File" name="file" valuePropName="fileList">
        <AntUpload beforeUpload={() => false} listType="text">
          <Button icon={<UploadOutlined />}>Select File</Button>
        </AntUpload>
      </Form.Item>

      <Button type="primary" block>
        Upload Video
      </Button>
    </Form>
  );
}
