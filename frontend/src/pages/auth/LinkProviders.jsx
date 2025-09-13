import { auth, googleProvider, githubProvider } from "../../firebase";
import { linkWithPopup } from "firebase/auth";
import { Button, Space, message } from "antd";
import { GoogleOutlined, GithubOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useFirebaseLoginMutation } from "../../redux/auth/authApi";
import { setCredentials } from "../../redux/auth/authSlice";

export default function LinkProviders() {
  const dispatch = useDispatch();
  const [firebaseLogin] = useFirebaseLoginMutation();

  const handleLink = async (provider) => {
    try {
      if (!auth.currentUser) {
        message.error("You must be logged in first.");
        return;
      }

      const result = await linkWithPopup(auth.currentUser, provider);
      console.log("Linked provider:", result.user.providerData);

      // Get fresh ID token
      const token = await result.user.getIdToken();

      // Sync with backend
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

  return (
    <Space direction="vertical">
      <Button
        icon={<GoogleOutlined />}
        onClick={() => handleLink(googleProvider)}
      >
        Link Google
      </Button>
      <Button
        icon={<GithubOutlined />}
        onClick={() => handleLink(githubProvider)}
      >
        Link GitHub
      </Button>
    </Space>
  );
}
