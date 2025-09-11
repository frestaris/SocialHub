import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import FeaturedCreators from "./components/FeaturedCreators";
import HowItWorks from "./components/HowItWorks";
import Login from "./pages/Login";

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

            {/* Login Page */}
            <Route path="/login" element={<Login />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}
