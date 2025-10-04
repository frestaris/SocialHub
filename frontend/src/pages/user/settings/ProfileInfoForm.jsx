// --- Ant Design ---
import { Form, Input, Button } from "antd";
import { useState } from "react";

export default function ProfileInfoForm({ hasPassword }) {
  const [showPasswordField, setShowPasswordField] = useState(false);

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
        <Input.TextArea rows={5} />
      </Form.Item>

      {/* Password section */}
      {!hasPassword ? (
        <Form.Item
          label="Set Password"
          name="password"
          rules={[
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (value.length < 6) {
                  return Promise.reject(
                    new Error("Password must be at least 6 characters")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.Password placeholder="Leave empty if you don’t want to set a password yet" />
        </Form.Item>
      ) : (
        // User already has a password → toggle with button
        <>
          {!showPasswordField ? (
            <Button
              type="dashed"
              shape="round"
              onClick={() => setShowPasswordField(true)}
            >
              Change Password
            </Button>
          ) : (
            <>
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (value.length < 6) {
                        return Promise.reject(
                          new Error("Password must be at least 6 characters")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password placeholder="Enter a new password" />
              </Form.Item>
            </>
          )}
        </>
      )}
    </>
  );
}
