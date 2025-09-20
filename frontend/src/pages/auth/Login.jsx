import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, googleProvider, githubProvider } from "../../firebase";
import { useFirebaseLoginMutation } from "../../redux/auth/authApi";
import { setCredentials } from "../../redux/auth/authSlice";
import {
  Button,
  Form,
  Input,
  Divider,
  Typography,
  Space,
  Alert,
  Spin,
} from "antd";
import { GoogleOutlined, GithubOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // RTK Query
  const [firebaseLogin, { isLoading: socialLoading, error: socialError }] =
    useFirebaseLoginMutation();

  const [isRegister, setIsRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const from = location.state?.from || "/explore";
  // Handle Firebase → backend error sync
  useEffect(() => {
    if (socialError) {
      setErrorMessage(socialError.data?.error || "Social login failed");
    }
  }, [socialError]);

  // Social login
  const handleSocialLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const data = await firebaseLogin(token).unwrap();
      if (data.success) {
        dispatch(setCredentials({ user: data.user, token }));
        setErrorMessage(null);

        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential") {
        const email = err.customData?.email;
        setErrorMessage(
          `This email (${email}) is already used with another provider. Please log in with that provider first, then link this one in your profile.`
        );
      } else {
        console.error(err);
        setErrorMessage("Social login failed");
      }
    }
  };

  // Email/password login or register
  const handleFormFinish = async (values) => {
    try {
      setFormLoading(true);
      let fbUser;
      if (isRegister) {
        fbUser = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
      } else {
        fbUser = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
      }

      const token = await fbUser.user.getIdToken();
      const data = await firebaseLogin({
        token,
        username: values.username,
      }).unwrap();

      if (data.success) {
        dispatch(setCredentials({ user: data.user, token }));
        setErrorMessage(null);

        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("❌ Firebase error:", err);
      setErrorMessage(err.message || "Authentication failed");
    } finally {
      setFormLoading(false);
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
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          padding: 24,
          border: "1px solid #eee",
          borderRadius: 8,
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          {isRegister ? "Create Account" : "Login"}
        </Title>

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

        <Form
          layout="vertical"
          onFinish={handleFormFinish}
          onChange={() => setErrorMessage(null)}
        >
          {isRegister && (
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please enter your username" },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password />
          </Form.Item>

          <Button type="link" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </Button>

          <Button type="primary" htmlType="submit" block disabled={formLoading}>
            {formLoading ? (
              <>
                <Spin size="small" />{" "}
                {isRegister ? "Registering..." : "Logging in..."}
              </>
            ) : isRegister ? (
              "Register"
            ) : (
              "Login"
            )}
          </Button>
        </Form>

        <Divider>or</Divider>

        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            icon={<GoogleOutlined />}
            block
            onClick={() => handleSocialLogin(googleProvider)}
            disabled={socialLoading}
          >
            {socialLoading ? <Spin size="small" /> : "Continue with Google"}
          </Button>

          <Button
            icon={<GithubOutlined />}
            block
            onClick={() => handleSocialLogin(githubProvider)}
            disabled={socialLoading}
          >
            {socialLoading ? <Spin size="small" /> : "Continue with GitHub"}
          </Button>
        </Space>

        <div style={{ textAlign: "center" }}>
          <Button
            type="link"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null);
            }}
          >
            {isRegister
              ? "Already have an account? Login"
              : "New here? Register"}
          </Button>
        </div>
      </div>
    </div>
  );
}
