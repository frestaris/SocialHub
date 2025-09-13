import { useSelector, useDispatch } from "react-redux";
import { auth, googleProvider, githubProvider } from "../../firebase";
import {
  linkWithPopup,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword,
} from "firebase/auth";
import {
  Button,
  Space,
  Typography,
  message,
  Card,
  Divider,
  Form,
  Input,
  Alert,
  Spin,
} from "antd";
import { GoogleOutlined, GithubOutlined } from "@ant-design/icons";
import { useFirebaseLoginMutation } from "../../redux/auth/authApi";
import { setCredentials } from "../../redux/auth/authSlice";
import { useState, useEffect } from "react";

const { Title, Text } = Typography;

export default function UserSettings() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [firebaseLogin] = useFirebaseLoginMutation();

  const [hasPassword, setHasPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Detect if user already has password login
  useEffect(() => {
    if (auth.currentUser) {
      const hasPw = auth.currentUser.providerData.some(
        (p) => p.providerId === "password"
      );
      setHasPassword(hasPw);
    }
  }, [auth.currentUser]);

  // Link providers
  const handleLink = async (provider) => {
    try {
      if (!auth.currentUser) {
        message.error("You must be logged in first.");
        return;
      }

      const result = await linkWithPopup(auth.currentUser, provider);

      // Get fresh ID token
      const token = await result.user.getIdToken();
      const data = await firebaseLogin(token).unwrap();
      if (data.success) {
        dispatch(setCredentials({ user: data.user, token }));
      }

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

  // Set password
  const handleSetPassword = async (values) => {
    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(
        values.email,
        values.password
      );
      await linkWithCredential(auth.currentUser, credential);

      const token = await auth.currentUser.getIdToken();
      const data = await firebaseLogin(token).unwrap();
      if (data.success) {
        dispatch(setCredentials({ user: data.user, token }));
      }

      setSuccessMessage("Password has been added successfully!");
      setErrorMessage(null);
      setHasPassword(true);
    } catch (err) {
      console.error("Set password error:", err);
      setSuccessMessage(null);
      if (err.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already linked to another account.");
      } else if (err.code === "auth/provider-already-linked") {
        setErrorMessage("Password login is already enabled for this account.");
      } else {
        setErrorMessage("Failed to set password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      await updatePassword(auth.currentUser, values.newPassword);
      setSuccessMessage("Password updated successfully!");
      setErrorMessage(null);
    } catch (err) {
      console.error("Change password error:", err);
      setSuccessMessage(null);
      if (err.code === "auth/requires-recent-login") {
        setErrorMessage("Please re-login before changing your password.");
      } else {
        setErrorMessage("Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafafa",
        padding: "24px",
      }}
    >
      <Card
        style={{ maxWidth: 500, width: "100%", padding: 24 }}
        title={<Title level={3}>User Settings</Title>}
      >
        {user ? (
          <>
            <Text>Email: {user.email}</Text>
            <br />
            <Text>Username: {user.username}</Text>
            <br />
            <br />

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

            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                icon={<GoogleOutlined />}
                block
                onClick={() => handleLink(googleProvider)}
              >
                Link Google
              </Button>
              <Button
                icon={<GithubOutlined />}
                block
                onClick={() => handleLink(githubProvider)}
              >
                Link GitHub
              </Button>
            </Space>

            {/* Conditionally show Set vs Change password */}
            {!hasPassword ? (
              <>
                <Divider>Add Password</Divider>
                <Form layout="vertical" onFinish={handleSetPassword}>
                  <Form.Item
                    label="Email"
                    name="email"
                    initialValue={user?.email}
                    rules={[
                      { required: true, message: "Please enter your email" },
                    ]}
                  >
                    <Input disabled />
                  </Form.Item>

                  <Form.Item
                    label="New Password"
                    name="password"
                    rules={[
                      { required: true, message: "Please enter a password" },
                      {
                        min: 6,
                        message: "Password must be at least 6 characters",
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spin size="small" /> Adding...
                      </>
                    ) : (
                      "Add Password"
                    )}
                  </Button>
                </Form>
              </>
            ) : (
              <>
                <Divider>Change Password</Divider>
                <Form layout="vertical" onFinish={handleChangePassword}>
                  <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                      {
                        required: true,
                        message: "Please enter a new password",
                      },
                      {
                        min: 6,
                        message: "Password must be at least 6 characters",
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    danger
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spin size="small" /> Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </Form>
              </>
            )}
          </>
        ) : (
          <Text>Please log in to see your settings.</Text>
        )}
      </Card>
    </div>
  );
}
