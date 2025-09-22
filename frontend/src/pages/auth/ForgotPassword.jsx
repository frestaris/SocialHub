import { useState } from "react";
import { Form, Input, Button, Typography, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { baseURL } from "../../utils/baseURL";
import { handleError, handleSuccess } from "../../utils/handleMessage";
import { getFirebaseErrorMessage } from "../../utils/firebaseErrorMessages";

const { Title } = Typography;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async (values) => {
    setIsLoading(true);

    try {
      const actionCodeSettings = {
        url: `${baseURL}/reset-password`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, values.email, actionCodeSettings);
      handleSuccess("Reset link sent! Check your email.");
    } catch (err) {
      const friendlyMessage = getFirebaseErrorMessage(err.code);
      handleError({ message: friendlyMessage }, "Password Reset Failed");
    } finally {
      setIsLoading(false);
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
          Forgot Password
        </Title>

        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" block disabled={isLoading}>
            {isLoading ? <Spin size="small" /> : "Send Reset Link"}
          </Button>
        </Form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button type="link" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
