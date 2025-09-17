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
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../../redux/user/userApi";
import { GoogleOutlined, GithubOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/auth/authSlice";
import { uploadToFirebase } from "../../../utils/uploadToFirebase";

export default function SettingsModal({ open, onClose, user }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues = {
    username: user?.username || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
    email: user?.email || "",
    password: "",
    newPassword: "",
  };

  useEffect(() => {
    if (auth.currentUser) {
      const pw = auth.currentUser.providerData.some(
        (p) => p.providerId === "password"
      );
      setHasPassword(pw);
    }
  }, []);

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

  const handleLinkProvider = async (provider) => {
    try {
      if (!auth.currentUser) {
        message.error("You must be logged in first.");
        return;
      }
      await linkWithPopup(auth.currentUser, provider);
      message.success(`Successfully linked ${provider.providerId}`);
    } catch (err) {
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
      // 🔹 Handle password logic
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
            message.error("Please re-login before changing your password.");
          } else {
            throw err;
          }
        }
      }

      // 🔹 Handle avatar (URL or file upload to Firebase)
      let avatarUrl = values.avatar; // from URL field if present
      if (values.avatarFile?.[0]?.originFileObj) {
        const file = values.avatarFile[0].originFileObj;

        if (file.size / 1024 / 1024 > 4) {
          message.error("Avatar must be smaller than 4MB!");
          setSaving(false);
          return;
        }

        // Upload avatar to Firebase under avatars/
        avatarUrl = await uploadToFirebase(
          file,
          auth.currentUser.uid,
          null,
          "avatars"
        );
      }

      // 🔹 Save to backend
      await updateUser({
        username: values.username,
        bio: values.bio,
        avatar: avatarUrl,
      }).unwrap();

      message.success("Profile updated successfully");
      setSaving(false);
      setIsChanged(false);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      message.error("Failed to save settings");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser().unwrap();
      message.success("Account deleted successfully");
      setDeleting(false);
      setConfirmOpen(false);
      onClose();
      dispatch(logout());
      navigate("/explore");
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Failed to delete account");
      setDeleting(false);
    }
  };

  return (
    <>
      <Modal
        title="Profile Settings"
        open={open}
        onCancel={onClose}
        footer={null}
        width="100%"
        style={{
          top: 10,
          maxWidth: 600,
          padding: "0 16px",
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
          <ProfileInfoForm />
          {!hasPassword ? (
            <>
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
            </>
          ) : (
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
            <Button danger onClick={() => setConfirmOpen(true)}>
              Delete Account
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

      {/* Confirm Delete Modal */}
      <Modal
        title="Confirm Account Deletion"
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onOk={handleDelete}
        okText={deleting ? "Deleting..." : "Confirm Delete"}
        okButtonProps={{
          danger: true,
          disabled: confirmEmail !== user?.email || deleting,
          loading: deleting,
        }}
        centered
      >
        <p>
          This action is <b>permanent</b>. Please type "<b>{user?.email}</b>" to
          confirm account deletion.
        </p>
        <Input
          placeholder="Enter your email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
        />
      </Modal>
    </>
  );
}
