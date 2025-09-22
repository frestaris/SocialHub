import { Modal, Divider, Form, Button, Spin, Input, Space } from "antd";
import { useState, useEffect, useMemo } from "react";
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
import { handleError, handleSuccess } from "../../../utils/handleMessage";

export default function SettingsModal({ open, onClose, user }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues = useMemo(
    () => ({
      username: user?.username || "",
      bio: user?.bio || "",
      avatar: user?.avatar || "",
      cover: user?.cover || "",
      password: "",
      newPassword: "",
    }),
    [user]
  );

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
    }
  }, [open, initialValues, form]);

  const handleValuesChange = () => {
    const currentValues = form.getFieldsValue();
    const unchanged = Object.keys(initialValues).every((key) => {
      if (key === "password" || key === "newPassword") {
        return !currentValues[key];
      }
      const initialVal = (initialValues[key] ?? "").toString().trim();
      const currentVal = (currentValues[key] ?? "").toString().trim();
      return initialVal === currentVal;
    });

    setIsChanged(!unchanged);
  };

  const handleLinkProvider = async (provider) => {
    try {
      if (!auth.currentUser) {
        handleError({ message: "You must be logged in first." }, "Link Failed");
        return;
      }

      await linkWithPopup(auth.currentUser, provider);
      handleSuccess(`Successfully linked ${provider.providerId}`);
    } catch (err) {
      if (err.code === "auth/credential-already-in-use") {
        handleError(
          { message: "This provider is already linked to another account." },
          "Link Failed"
        );
      } else {
        handleError(err, "Failed to link account");
      }
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      // 🔹 Password logic
      if (!hasPassword && values.password) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          values.password
        );
        await linkWithCredential(auth.currentUser, credential);
        setHasPassword(true);
        handleSuccess("Password has been added successfully!");
      } else if (hasPassword && values.newPassword) {
        try {
          await updatePassword(auth.currentUser, values.newPassword);
          handleSuccess("Password updated successfully!");
        } catch (err) {
          if (err.code === "auth/requires-recent-login") {
            handleError(
              { message: "Please re-login before changing your password." },
              "Password Update Failed"
            );
          } else throw err;
        }
      }

      // 🔹 Handle avatar (URL or file upload to Firebase)
      let avatarUrl = values.avatar;
      if (values.avatarFile?.[0]?.originFileObj) {
        const file = values.avatarFile[0].originFileObj;

        if (file.size / 1024 / 1024 > 4) {
          handleError({ message: "Avatar must be smaller than 4MB!" });
          setSaving(false);
          return;
        }

        avatarUrl = await uploadToFirebase(
          file,
          auth.currentUser.uid,
          (progress) => setAvatarProgress(progress),
          "avatars"
        );
      }

      // 🔹 Handle cover (URL or file upload to Firebase)
      let coverUrl = values.cover;
      if (values.coverFile?.[0]?.originFileObj) {
        const file = values.coverFile[0].originFileObj;

        if (file.size / 1024 / 1024 > 4) {
          handleError({ message: "Cover must be smaller than 4MB!" });
          setSaving(false);
          return;
        }

        coverUrl = await uploadToFirebase(
          file,
          auth.currentUser.uid,
          (progress) => setCoverProgress(progress),
          "covers"
        );
      }

      // 🔹 Save to backend
      await updateUser({
        username: values.username,
        bio: values.bio,
        avatar: avatarUrl,
        cover: coverUrl,
      }).unwrap();

      handleSuccess("Profile updated successfully");
      setSaving(false);
      setIsChanged(false);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      handleError(err, "Failed to save settings");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser().unwrap();
      handleSuccess("Account deleted successfully");
      setDeleting(false);
      setConfirmOpen(false);
      onClose();
      dispatch(logout());
      navigate("/explore");
    } catch (err) {
      console.error("Delete error:", err);
      handleError(err, "Failed to delete account");
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
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSave}
          onValuesChange={handleValuesChange}
        >
          <ProfileInfoForm />
          <Divider></Divider>
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
              {saving ? (
                <>
                  <Spin size="small" style={{ marginRight: 8 }} />
                  {avatarProgress > 0 && avatarProgress < 100
                    ? `Saving... ${Math.round(avatarProgress)}%`
                    : coverProgress > 0 && coverProgress < 100
                    ? `Saving... ${Math.round(coverProgress)}%`
                    : avatarProgress === 100 || coverProgress === 100
                    ? "Finalizing..."
                    : "Saving..."}
                </>
              ) : (
                "Save"
              )}
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
