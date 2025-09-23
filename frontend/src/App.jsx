import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Navigation from "./components/Navigation";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import HomePage from "./pages/homepage/HomePage";
import Explore from "./pages/explore/Explore";
import Profile from "./pages/user/profile/Profile";
import Post from "./pages/post/Post";

const { Content } = Layout;

export default function App() {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Navbar */}
        <Navigation />

        {/* Content Area */}
        <Content>
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:category" element={<Explore />} />
            <Route path="/post/:id" element={<Post />} />

            <Route path="/profile/:id" element={<Profile />} />

            {/* Auth Page */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}
