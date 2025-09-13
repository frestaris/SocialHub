import { Form, Input, Button, Select } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

export default function PostForm() {
  return (
    <Form layout="vertical">
      <Form.Item
        label="Post Content"
        name="content"
        rules={[{ required: true }]}
      >
        <TextArea rows={4} placeholder="What's on your mind?" />
      </Form.Item>

      <Form.Item label="Category" name="category">
        <Select placeholder="Select category">
          <Option value="update">Update</Option>
          <Option value="announcement">Announcement</Option>
          <Option value="community">Community</Option>
        </Select>
      </Form.Item>

      <Button type="primary" icon={<FileTextOutlined />} block>
        Publish Post
      </Button>
    </Form>
  );
}
