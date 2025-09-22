import { Button, Space } from "antd";
import { GoogleOutlined, GithubOutlined } from "@ant-design/icons";
import { auth, googleProvider, githubProvider } from "../../../firebase";
import { linkWithPopup } from "firebase/auth";
import { useFirebaseLoginMutation } from "../../../redux/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../redux/auth/authSlice";
import { handleError, handleSuccess } from "../../../utils/handleMessage";

export default function LinkedAccounts() {
  const [firebaseLogin] = useFirebaseLoginMutation();
  const dispatch = useDispatch();

  const handleLink = async (provider) => {
    try {
      if (!auth.currentUser) {
        handleError(
          { message: "You must be logged in to link an account." },
          "Link Failed"
        );
        return;
      }

      const result = await linkWithPopup(auth.currentUser, provider);
      const token = await result.user.getIdToken();

      const data = await firebaseLogin({ token }).unwrap();
      if (data.success) {
        dispatch(setCredentials({ user: data.user, token }));
        handleSuccess(`${provider.providerId} account linked successfully!`);
      }
    } catch (err) {
      console.error("Link error:", err);
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
