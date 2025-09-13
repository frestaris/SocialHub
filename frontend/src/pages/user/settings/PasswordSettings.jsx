import { Form, Input } from "antd";
import { useState, useEffect } from "react";
import { auth } from "../../../firebase";

export default function PasswordSettings() {
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      const pw = auth.currentUser.providerData.some(
        (p) => p.providerId === "password"
      );
      setHasPassword(pw);
    }
  }, []);

  return !hasPassword ? (
    <>
      <Form.Item label="Email" name="email">
        <Input disabled />
      </Form.Item>

      <Form.Item
        label="Create Password"
        name="password"
        rules={[{ required: true, min: 6 }]}
      >
        <Input.Password placeholder="Enter a password" />
      </Form.Item>
    </>
  ) : (
    <>
      <Form.Item label="New Password" name="new password" rules={[{ min: 6 }]}>
        <Input.Password placeholder="Enter new password if you want to change it" />
      </Form.Item>
    </>
  );
}
