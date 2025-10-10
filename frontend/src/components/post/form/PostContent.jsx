import { Form, Input, Select } from "antd";
import { categories } from "../../../utils/posts/categories";
const { TextArea } = Input;

export default function PostContent({ label = "Content" }) {
  return (
    <>
      <Form.Item
        label={label}
        name="content"
        rules={[{ required: true, message: "Content is required" }]}
      >
        <TextArea rows={3} placeholder="What's on your mind?" />
      </Form.Item>
      <Form.Item
        label="Category"
        name="category"
        rules={[{ required: true, message: "Please select a category" }]}
      >
        <Select placeholder="Select category">
          {categories.map((cat) => (
            <Select.Option key={cat.key} value={cat.key}>
              {cat.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
}
