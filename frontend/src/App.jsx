import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Navigation from "./components/Navigation";
import Home from "./pages/homepage/Home";
import FeaturedCreators from "./pages/homepage/FeaturedCreators";
import HowItWorks from "./pages/homepage/HowItWorks";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import UserSettings from "./pages/auth/UserSettings";

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
            <Route
              path="/"
              element={
                <>
                  <Home />
                  <HowItWorks />
                  <FeaturedCreators />
                </>
              }
            />

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
