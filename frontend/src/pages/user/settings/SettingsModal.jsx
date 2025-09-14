import {
  Modal,
  Divider,
  Form,
  Button,
  Spin,
  message,
  Input,
  Alert,
  Space,
} from "antd";
import { useState, useEffect } from "react";
import ProfileInfoForm from "./ProfileInfoForm";
import { auth, googleProvider, githubProvider } from "../../../firebase";
import {
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  updatePassword,
} from "firebase/auth";
import { useUpdateUserMutation } from "../../../redux/user/userApi";
import { GoogleOutlined, GithubOutlined } from "@ant-design/icons";

export default function SettingsModal({ open, onClose, user }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [updateUser] = useUpdateUserMutation();

  const initialValues = {
    username: user?.username || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
    email: user?.email || "",
    password: "",
    newPassword: "",
  };

  // Detect if user already has password login
  useEffect(() => {
    if (auth.currentUser) {
      const pw = auth.currentUser.providerData.some(
        (p) => p.providerId === "password"
      );
      setHasPassword(pw);
    }
  }, []);

  // Reset form values when modal opens
  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
      setIsChanged(false);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [open, user]);

  const handleValuesChange = () => {
    const currentValues = form.getFieldsValue();
    const changed = Object.keys(initialValues).some((key) => {
      if (
        (key === "password" || key === "newPassword") &&
        !currentValues[key]
      ) {
        return false;
      }
      return (initialValues[key] ?? "") !== (currentValues[key] ?? "");
    });
    setIsChanged(changed);
  };

  // Link providers
  const handleLinkProvider = async (provider) => {
    try {
      if (!auth.currentUser) {
        message.error("You must be logged in first.");
        return;
      }
      await linkWithPopup(auth.currentUser, provider);
      message.success(`Successfully linked ${provider.providerId}`);
    } catch (err) {
      console.error("Linking error:", err);
      if (err.code === "auth/credential-already-in-use") {
        message.error("This provider is already linked to another account.");
      } else {
        message.error("Failed to link account.");
      }
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      // 1. Handle password logic only if provided
      if (!hasPassword && values.password) {
        const credential = EmailAuthProvider.credential(
          values.email,
          values.password
        );
        await linkWithCredential(auth.currentUser, credential);
        setHasPassword(true);
        message.success("Password has been added successfully!");
      } else if (hasPassword && values.newPassword) {
        try {
          await updatePassword(auth.currentUser, values.newPassword);
          message.success("Password updated successfully!");
        } catch (err) {
          if (err.code === "auth/requires-recent-login") {
            message.error(
              "For security reasons, please log out and log in again before changing your password."
            );
          } else {
            throw err;
          }
        }
      }

      // 2. Update profile in backend
      await updateUser({
        username: values.username,
        bio: values.bio,
        avatar: values.avatar,
      }).unwrap();

      message.success("Profile updated successfully");

      setTimeout(() => {
        setSaving(false);
        setIsChanged(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error("Save error:", err);
      message.error("Failed to save settings");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      console.log("Deleting account...");
      // TODO: call backend deleteUser
      setTimeout(() => {
        setDeleting(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Delete account error:", err);
      message.error("Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <Modal
      title="Profile Settings"
      open={open}
      onCancel={onClose}
      footer={null}
      width="100%"
      style={{
        top: 20,
        maxWidth: 600,
        padding: "0 16px",
      }}
      stylesBody={{
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: 0,
      }}
      destroyOnHidden
    >
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          showIcon
          closable
          onClose={() => setErrorMessage(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          showIcon
          closable
          onClose={() => setSuccessMessage(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSave}
        onValuesChange={handleValuesChange}
      >
        <Divider>Profile Info</Divider>
        <ProfileInfoForm />

        <Divider>Password</Divider>
        {!hasPassword ? (
          <>
            <Form.Item label="Email" name="email">
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Set Password"
              name="password"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve(); // optional
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
          </>
        ) : (
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve(); // optional
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
            <Input.Password placeholder="Leave empty if you don’t want to change it" />
          </Form.Item>
        )}

        <Divider>Linked Accounts</Divider>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            icon={<GoogleOutlined />}
            block
            onClick={() => handleLinkProvider(googleProvider)}
          >
            Link Google
          </Button>
          <Button
            icon={<GithubOutlined />}
            block
            onClick={() => handleLinkProvider(githubProvider)}
          >
            Link GitHub
          </Button>
        </Space>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button danger onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spin size="small" style={{ marginRight: 8 }} /> : null}
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            disabled={!isChanged || saving}
          >
            {saving ? <Spin size="small" style={{ marginRight: 8 }} /> : null}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
