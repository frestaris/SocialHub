import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import {
  useFirebaseLoginMutation,
  useLoginMutation,
  useRegisterMutation,
} from "../redux/auth/authApi";
import { setCredentials, logout } from "../redux/auth/authSlice";
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
import { GoogleOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // RTK Query mutations
  const [firebaseLogin, { isLoading: socialLoading, error: socialError }] =
    useFirebaseLoginMutation();
  const [loginUser, { isLoading: loginLoading, error: loginError }] =
    useLoginMutation();
  const [registerUser, { isLoading: registerLoading, error: registerError }] =
    useRegisterMutation();

  const [isRegister, setIsRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync RTK Query errors → local state
  useEffect(() => {
    if (loginError) {
      setErrorMessage(loginError.data?.error || "Login failed");
    } else if (registerError) {
      setErrorMessage(registerError.data?.error || "Registration failed");
    } else if (socialError) {
      setErrorMessage(socialError.data?.error || "Social login failed");
    } else {
      setErrorMessage(null); // clear when no errors
    }
  }, [loginError, registerError, socialError]);

  // Social login handler
  const handleSocialLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const data = await firebaseLogin(token).unwrap();
      if (data.success) {
        dispatch(setCredentials({ user: data.user, token }));
        // navigate("/explore");
        setErrorMessage(null);
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Social login failed");
    }
  };

  // Email/password form submit
  const handleFormFinish = async (values) => {
    try {
      let data;
      if (isRegister) {
        data = await registerUser(values).unwrap();
      } else {
        data = await loginUser(values).unwrap();
      }
      if (data.success) {
        dispatch(setCredentials({ user: data.user, token: "local" }));
        // navigate("/explore");
        setErrorMessage(null);
      }
    } catch (err) {
      console.log(err);
      // RTK Query error already handled in useEffect
    }
  };

  if (user) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Title level={3}>Welcome, {user.username || user.email}!</Title>
        <Button type="primary" danger onClick={() => dispatch(logout())}>
          Logout
        </Button>
      </div>
    );
  }

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
            onClose={() => setErrorMessage(null)} // allow manual close
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

          <Button
            type="primary"
            htmlType="submit"
            block
            disabled={loginLoading || registerLoading}
          >
            {loginLoading || registerLoading ? (
              <Spin size="small" />
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
        </Space>

        <div style={{ textAlign: "center" }}>
          <Button
            type="link"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage(null); // clear when switching modes
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
