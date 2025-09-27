import { useState, useEffect } from "react";

// --- Routing ---
import { useNavigate, useSearchParams } from "react-router-dom";

// --- Firebase ---
import { auth } from "../../firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

// --- UI Libraries ---
import { Form, Input, Button, Typography, Spin, Result } from "antd";

// --- Utils ---
import { handleSuccess, handleError } from "../../utils/handleMessage";

const { Title } = Typography;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [validCode, setValidCode] = useState(false);

  // --- Verify code on mount ---
  useEffect(() => {
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => setValidCode(true))
        .catch((err) => {
          handleError(err, "Reset Password");
        });
    }
  }, [oobCode]);

  // --- Handle form submit ---
  const handleFinish = async (values) => {
    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      handleSuccess("Password reset successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      handleError(err, "Reset Password");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Guard: missing reset code ---
  if (!oobCode) {
    return (
      <Result
        status="error"
        title="Invalid Reset Link"
        subTitle="No reset code provided."
      />
    );
  }

  // --- Guard: invalid or expired code ---
  if (!validCode) {
    return (
      <Result
        status="error"
        title="Invalid or Expired Link"
        subTitle="Your password reset link is invalid or expired."
      />
    );
  }

  // --- Main UI ---
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
        {/* Title */}
        <Title level={3} style={{ textAlign: "center" }}>
          Reset Password
        </Title>

        {/* Reset Form */}
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="New Password"
            name="password"
            rules={[{ required: true, message: "Please enter a new password" }]}
          >
            <Input.Password />
          </Form.Item>

          <Button type="primary" htmlType="submit" block disabled={isLoading}>
            {isLoading ? (
              <>
                <Spin size="small" /> Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </Form>
      </div>
    </div>
  );
}
