import { Form, Input } from "antd";

export default function ProfileInfoForm() {
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

      <Form.Item label="Avatar URL" name="avatar">
        <Input />
      </Form.Item>
    </>
  );
}
