// --- Ant Design ---
import { Form, Input } from "antd";

// --- React ---
import { useState, useEffect } from "react";

// --- Firebase ---
import { auth } from "../../../firebase";

export default function PasswordSettings() {
  const [hasPassword, setHasPassword] = useState(false);

  // Check if the current Firebase user has a password provider linked.
  useEffect(() => {
    if (auth.currentUser) {
      const hasPwProvider = auth.currentUser.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setHasPassword(hasPwProvider);
    }
  }, []);

  return !hasPassword ? (
    <>
      {/* Show this if user has NO password (e.g., signed up with Google/GitHub) */}
      <Form.Item label="Email" name="email">
        <Input disabled />
      </Form.Item>

      <Form.Item
        label="Create Password"
        name="password"
        rules={[
          { required: true, message: "Password is required" },
          { min: 6, message: "Password must be at least 6 characters" },
        ]}
      >
        <Input.Password placeholder="Enter a new password" />
      </Form.Item>
    </>
  ) : (
    <>
      {/* Show this if user ALREADY has a password */}
      <Form.Item
        label="New Password"
        name="newPassword" // changed from "new password" (spaces in field names cause issues)
        rules={[{ min: 6, message: "Password must be at least 6 characters" }]}
      >
        <Input.Password placeholder="Enter a new password if you want to change it" />
      </Form.Item>
    </>
  );
}
