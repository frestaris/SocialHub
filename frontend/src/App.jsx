import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout, Spin } from "antd";
import { Suspense, lazy } from "react";

import Navigation from "./components/Navigation";
import NotFound from "./components/NotFound";

// 👇 Import the hook
import useNotificationsSocket from "./utils/useNotificationsSocket";

const { Content } = Layout;

// Lazy-loaded pages (heavier ones)
const HomePage = lazy(() => import("./pages/homepage/HomePage"));
const Explore = lazy(() => import("./pages/explore/Explore"));
const Profile = lazy(() => import("./pages/user/profile/Profile"));
const Post = lazy(() => import("./pages/post/Post"));

// Auth pages
const Login = lazy(() => import("./pages/auth/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

export default function App() {
  // 👇 Hook runs once globally and listens for notifications
  useNotificationsSocket();

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Global navigation bar (always visible) */}
        <Navigation />

        {/* Suspense ensures fallback while lazy routes load */}
        <Content>
          <Suspense
            fallback={
              <div
                style={{
                  minHeight: "50vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Spin size="large" />
              </div>
            }
          >
            <Routes>
              {/* ---------- Public Pages ---------- */}
              <Route path="/" element={<HomePage />} />

              {/* Explore feed: all posts or by category */}
              <Route path="/explore" element={<Explore />} />
              <Route path="/explore/:category" element={<Explore />} />

              {/* Single post page */}
              <Route path="/post/:id" element={<Post />} />

              {/* User profile page */}
              <Route path="/profile/:id" element={<Profile />} />

              {/* Fallback for undefined routes */}
              <Route path="*" element={<NotFound />} />

              {/* ---------- Auth Pages ---------- */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Router>
  );
}
