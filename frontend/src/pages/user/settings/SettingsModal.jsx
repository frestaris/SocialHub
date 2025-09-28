import { useState, useEffect, useMemo } from "react";

// --- Ant Design ---
import { Modal, Divider, Form, Button, Spin, Input, Space } from "antd";
import { GoogleOutlined, GithubOutlined } from "@ant-design/icons";

// --- Firebase ---
import { auth, googleProvider, githubProvider } from "../../../firebase";
import {
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  updatePassword,
} from "firebase/auth";

// --- Redux ---
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../../redux/user/userApi";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/auth/authSlice";

// --- Routing ---
import { useNavigate } from "react-router-dom";

// --- Components ---
import ProfileInfoForm from "./ProfileInfoForm";

// --- Utils ---
import { handleError, handleSuccess } from "../../../utils/handleMessage";
import SocialLink from "./SocialLink";

export default function SettingsModal({ open, onClose, user }) {
  const [form] = Form.useForm();

  // --- Local state ---
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState(
    auth.currentUser?.providerData.map((p) => p.providerId) || []
  );

  // --- Redux hooks ---
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const dispatch = useDispatch();

  // --- Router ---
  const navigate = useNavigate();

  // --- Initial form values ---
  const initialValues = useMemo(
    () => ({
      username: user?.username || "",
      bio: user?.bio || "",
      password: "",
      newPassword: "",
    }),
    [user]
  );
  // Whenever modal opens → refresh providers from Firebase
  useEffect(() => {
    if (open && auth.currentUser) {
      setLinkedProviders(
        auth.currentUser.providerData.map((p) => p.providerId)
      );
    }
  }, [open]);

  // Detect if user has password set (email/password provider)
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
    }
  }, [open, initialValues, form]);

  // Detect if form values are changed from initial
  const handleValuesChange = () => {
    const currentValues = form.getFieldsValue();
    const unchanged = Object.keys(initialValues).every((key) => {
      if (key === "password" || key === "newPassword") {
        return !currentValues[key]; // ignore empty passwords
      }
      const initialVal = (initialValues[key] ?? "").toString().trim();
      const currentVal = (currentValues[key] ?? "").toString().trim();
      return initialVal === currentVal;
    });
    setIsChanged(!unchanged);
  };

  // Link external providers (Google/GitHub)
  const handleLinkProvider = async (provider) => {
    try {
      if (!auth.currentUser) {
        handleError({ message: "You must be logged in first." }, "Link Failed");
        return;
      }

      await linkWithPopup(auth.currentUser, provider);
      setLinkedProviders(
        auth.currentUser.providerData.map((p) => p.providerId)
      );

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

  // Save profile changes (username, bio, password)
  const handleSave = async (values) => {
    setSaving(true);
    try {
      // --- Password logic ---
      if (!hasPassword && values.password) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          values.password
        );
        await linkWithCredential(auth.currentUser, credential);
        setHasPassword(true);
      } else if (hasPassword && values.newPassword) {
        try {
          await updatePassword(auth.currentUser, values.newPassword);
        } catch (err) {
          if (err.code === "auth/requires-recent-login") {
            handleError(
              { message: "Please re-login before changing your password." },
              "Password Update Failed"
            );
          } else throw err;
        }
      }

      // --- Update user in backend ---
      await updateUser({
        username: values.username,
        bio: values.bio,
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

  // Delete account
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
      {/* ---- Main Settings Modal ---- */}
      <Modal
        title="Profile Settings"
        open={open}
        onCancel={onClose}
        footer={null}
        width="100%"
        style={{ top: 50, maxWidth: 600, padding: "0 16px" }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSave}
          onValuesChange={handleValuesChange}
        >
          <ProfileInfoForm hasPassword={hasPassword} />

          <Divider>Link Socials</Divider>

          <Space direction="vertical" style={{ width: "100%" }}>
            <SocialLink
              providerId="google.com"
              label="Google"
              icon={<GoogleOutlined />}
              color="#DB4437"
              provider={googleProvider}
              linkedProviders={linkedProviders}
              handleLinkProvider={handleLinkProvider}
            />
            <SocialLink
              providerId="github.com"
              label="GitHub"
              icon={<GithubOutlined />}
              color="#181717"
              provider={githubProvider}
              linkedProviders={linkedProviders}
              handleLinkProvider={handleLinkProvider}
            />
          </Space>

          {/* Footer actions */}
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
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ---- Confirm Delete Modal ---- */}
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
