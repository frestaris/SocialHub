import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Navigation from "./components/Navigation";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import UserSettings from "./pages/auth/UserSettings";
import HomePage from "./pages/homepage/HomePage";
import Explore from "./pages/explore/Explore";

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

            {/* Auth Page */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/settings" element={<UserSettings />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}
