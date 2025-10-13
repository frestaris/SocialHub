import { useState } from "react";
import { useDispatch } from "react-redux";

// --- Firebase Auth ---
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

// --- Routing ---
import { useLocation, useNavigate } from "react-router-dom";

// --- Redux API ---
import { useFirebaseLoginMutation } from "../../redux/auth/authApi";
import { setCredentials } from "../../redux/auth/authSlice";

// --- Firebase Config ---
import { auth, googleProvider, githubProvider } from "../../firebase";

// --- Libraries ---
import { Button, Form, Input, Divider, Typography, Space, Spin } from "antd";
import { LoginOutlined, UserAddOutlined } from "@ant-design/icons";

// --- Assets ---
import googleIcon from "../../assets/google-logo.png";
import githubIcon from "../../assets/github.png";
import bgImage from "../../assets/bg-card-1.jpg";

// --- Utils ---
import { handleError, handleSuccess } from "../../utils/handleMessage";
import GradientButton from "../../components/common/GradientButton";

const { Title } = Typography;

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // API hook
  const [firebaseLogin, { isLoading: socialLoading }] =
    useFirebaseLoginMutation();
  const [activeMethod, setActiveMethod] = useState(null); // "form" | "google" | "github"

  // Local state
  const [isRegister, setIsRegister] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Redirect after login
  const from = location.state?.from || "/explore";

  // --- Social login handler ---
  const handleSocialLogin = async (provider) => {
    try {
      // figure out which provider
      if (provider.providerId?.includes("google")) setActiveMethod("google");
      else if (provider.providerId?.includes("github"))
        setActiveMethod("github");

      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const data = await firebaseLogin({ token }).unwrap();
      if (data.success) {
        dispatch(setCredentials({ user: data.user, token }));
        navigate(from, { replace: true });
      }
    } catch (err) {
      handleError(err, "Login failed");
    } finally {
      setActiveMethod(null); // reset after done
    }
  };

  // --- Email/password login or register ---
  const handleFormFinish = async (values) => {
    try {
      setActiveMethod("form");
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
        handleSuccess(
          isRegister ? "Account created!" : "Logged in successfully!"
        );
        navigate(from, { replace: true });
      }
    } catch (err) {
      handleError(err, "Login failed", isRegister);
    } finally {
      setFormLoading(false);
      setActiveMethod(null); // reset after done
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
          backgroundImage: `linear-gradient(
      rgba(255, 255, 255, 0.94),
      rgba(255, 255, 255, 0.94)
    ), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Title */}
        <Title level={3} style={{ textAlign: "center" }}>
          {isRegister ? "Create Account" : "Login"}
        </Title>

        {/* Email/Password Form */}
        <Form layout="vertical" onFinish={handleFormFinish}>
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

          {/* Forgot Password Link */}
          <Button type="link" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </Button>

          {/* Submit Button */}
          <GradientButton
            htmlType="submit"
            block
            loading={formLoading || (socialLoading && activeMethod === "form")}
            disabled={formLoading || (socialLoading && activeMethod === "form")}
            icon={
              formLoading ||
              (socialLoading && activeMethod === "form") ? null : isRegister ? (
                <UserAddOutlined style={{ fontSize: 16 }} />
              ) : (
                <LoginOutlined style={{ fontSize: 16 }} />
              )
            }
            text={
              formLoading || (socialLoading && activeMethod === "form")
                ? isRegister
                  ? "Registering..."
                  : "Logging in..."
                : isRegister
                ? "Register"
                : "Login"
            }
          />
        </Form>

        {/* Divider */}
        <Divider>or</Divider>

        {/* Social Buttons */}
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            icon={
              <img
                src={googleIcon}
                alt="Google"
                style={{ width: 18, height: 18, marginRight: 8 }}
              />
            }
            block
            onClick={() => handleSocialLogin(googleProvider)}
            disabled={socialLoading && activeMethod === "google"}
          >
            {socialLoading && activeMethod === "google" ? (
              <Spin size="small" />
            ) : (
              "Continue with Google"
            )}
          </Button>

          <Button
            icon={
              <img
                src={githubIcon}
                alt="Github"
                style={{ width: 18, height: 18, marginRight: 8 }}
              />
            }
            block
            onClick={() => handleSocialLogin(githubProvider)}
            disabled={socialLoading && activeMethod === "github"}
          >
            {socialLoading && activeMethod === "github" ? (
              <Spin size="small" />
            ) : (
              "Continue with GitHub"
            )}
          </Button>
        </Space>

        {/* Toggle Login/Register */}
        <div style={{ textAlign: "center" }}>
          <Button type="link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister
              ? "Already have an account? Login"
              : "New here? Register"}
          </Button>
        </div>
      </div>
    </div>
  );
}
