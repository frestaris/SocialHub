// --- Ant Design ---
import { Button, Space } from "antd";
import { GoogleOutlined, GithubOutlined } from "@ant-design/icons";

// --- Firebase ---
import { auth, googleProvider, githubProvider } from "../../../firebase";
import { linkWithPopup } from "firebase/auth";

// --- Redux ---
import { useDispatch } from "react-redux";
import { useFirebaseLoginMutation } from "../../../redux/auth/authApi";
import { setCredentials } from "../../../redux/auth/authSlice";

// --- Utils ---
import { handleError, handleSuccess } from "../../../utils/handleMessage";

export default function LinkedAccounts() {
  const [firebaseLogin] = useFirebaseLoginMutation();
  const dispatch = useDispatch();

  // Handles linking to a Firebase provider
  const handleLink = async (provider) => {
    try {
      if (!auth.currentUser) {
        handleError(
          { message: "You must be logged in to link an account." },
          "Link Failed"
        );
        return;
      }

      // Open popup to link provider to the logged-in Firebase user
      const result = await linkWithPopup(auth.currentUser, provider);
      const token = await result.user.getIdToken();

      // Call backend (RTK Query) to sync user
      const data = await firebaseLogin({ token }).unwrap();

      if (data.success) {
        dispatch(setCredentials({ user: data.user, token }));
        handleSuccess(`${provider.providerId} account linked successfully!`);
      }
    } catch (err) {
      console.error("❌ Link error:", err);
      handleError(err, "Failed to link account");
    }
  };

  return (
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
  );
}
