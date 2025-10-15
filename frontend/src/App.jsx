import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";

import Navigation from "./components/common/Navigation";
import NotFound from "./components/common/NotFound";
import ChatDock from "./components/chat/ChatDock";

import { initAnalytics } from "./utils/analytics/analytics";
import AnalyticsTracker from "./utils/analytics/AnalyticsTracker";
import useNotificationsSocket from "./utils/sockets/useNotificationsSocket";
import useAuthTokenRefresh from "./utils/firebase/useAuthTokenRefresh";
import useChatSocket from "./utils/sockets/useChatSocket";
import ScrollToTop from "./utils/ScrollToTop";
import { useSelector } from "react-redux";

import HomePage from "./pages/homepage/HomePage";
import Explore from "./pages/explore/Explore";
import Profile from "./pages/user/profile/Profile";
import Post from "./pages/post/Post";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import About from "./pages/footer/About";
import PrivacyPolicy from "./pages/footer/PrivacyPolicy";
import TermsOfService from "./pages/footer/TermsOfService";

const { Content } = Layout;

export default function App() {
  const user = useSelector((s) => s.auth.user);

  // Initialize sockets
  useNotificationsSocket();
  useChatSocket();
  useAuthTokenRefresh();

  // Initialize Google Analytics
  useEffect(() => {
    const GA_ID = import.meta.env.VITE_GA_ID;
    initAnalytics(GA_ID);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AnalyticsTracker />
      <Layout style={{ minHeight: "100vh" }}>
        {/* --- Navigation bar --- */}
        <Navigation />

        <Content>
          <Routes>
            {/* ---------- Public Pages ---------- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:category" element={<Explore />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="*" element={<NotFound />} />
            {/* ---------- Auth Pages ---------- */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </Content>

        {/* --- Chat Dock (only when logged in) --- */}
        {user?._id && <ChatDock />}
      </Layout>
    </Router>
  );
}
