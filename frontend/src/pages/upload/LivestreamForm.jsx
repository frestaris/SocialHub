import { Form, Input, Button, Select, Switch } from "antd";
import { VideoCameraOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

export default function LivestreamForm() {
  return (
    <Form layout="vertical">
      <Form.Item label="Stream Title" name="title" rules={[{ required: true }]}>
        <Input placeholder="Enter stream title" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <TextArea rows={3} placeholder="What is your stream about?" />
      </Form.Item>

      <Form.Item label="Category" name="category">
        <Select placeholder="Select category">
          <Option value="gaming">Gaming</Option>
          <Option value="music">Music</Option>
          <Option value="art">Art</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Activate Stream">
        <Switch defaultChecked />
      </Form.Item>

      <Button type="primary" icon={<VideoCameraOutlined />} block>
        Go Live
      </Button>
    </Form>
  );
}
