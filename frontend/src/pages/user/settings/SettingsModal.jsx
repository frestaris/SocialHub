import { Modal, Divider, Form, Button, Spin, message } from "antd";
import { useState } from "react";
import ProfileInfoForm from "./ProfileInfoForm";
import LinkedAccounts from "./LinkedAccounts";
import PasswordSettings from "./PasswordSettings";
import { auth } from "../../../firebase";
import { updatePassword } from "firebase/auth";

export default function SettingsModal({ open, onClose, user }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const initialValues = {
    username: user?.username || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
    email: user?.email || "",
    password: "",
    newPassword: "",
  };

  const handleValuesChange = () => {
    const currentValues = form.getFieldsValue();

    const changed = Object.keys(initialValues).some((key) => {
      // Ignore password fields unless user typed something
      if (
        (key === "password" || key === "newPassword") &&
        !currentValues[key]
      ) {
        return false;
      }

      const initial = initialValues[key] ?? "";
      const current = currentValues[key] ?? "";
      return initial !== current;
    });

    setIsChanged(changed);
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      console.log("Saving settings:", values);

      // ✅ Only update password if provided
      if (values.password || values.newPassword) {
        const newPass = values.password || values.newPassword;
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, newPass);
          message.success("Password updated successfully");
        }
      }

      // ✅ TODO: Call your API here for profile info updates
      // await updateUser({ username: values.username, bio: values.bio, avatar: values.avatar })

      setTimeout(() => {
        setSaving(false);
        setIsChanged(false); // disable button again after save
        onClose();
      }, 1500);
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
      // 🔑 TODO: Call your API here to delete the account
      // await deleteAccount(user._id)

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
        padding: "16px",
      }}
      stylesBody={{
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: 0,
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
        <Divider>Profile Info</Divider>
        <ProfileInfoForm />

        <Divider>Password</Divider>
        <PasswordSettings />

        <Divider>Linked Accounts</Divider>
        <LinkedAccounts />

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Delete Account button (left) */}
          <Button danger onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spin size="small" style={{ marginRight: 8 }} /> : null}
            {deleting ? "Deleting..." : "Delete Account"}
          </Button>

          {/* Save button (right) */}
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
