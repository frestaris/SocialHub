import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Alert, Spin } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../../firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

const { Title } = Typography;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode"); // Firebase sends this in email link

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validCode, setValidCode] = useState(false);

  useEffect(() => {
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => setValidCode(true))
        .catch(() => setErrorMessage("Invalid or expired reset link"));
    }
  }, [oobCode]);

  const handleFinish = async (values) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      setSuccessMessage("Password reset successful! Redirecting...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || "Reset failed");
      setIsLoading(false);
    }
  };

  if (!oobCode) {
    return <Alert type="error" message="No reset code provided" showIcon />;
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
          Reset Password
        </Title>

        {errorMessage && <Alert type="error" message={errorMessage} showIcon />}
        {successMessage && (
          <Alert type="success" message={successMessage} showIcon />
        )}

        {validCode && (
          <Form layout="vertical" onFinish={handleFinish}>
            <Form.Item
              label="New Password"
              name="password"
              rules={[
                { required: true, message: "Please enter a new password" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Button type="primary" htmlType="submit" block disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spin size="small" />{" "}
                  {successMessage ? "Redirecting..." : "Resetting Password..."}
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}
