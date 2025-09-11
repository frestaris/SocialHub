import { Layout } from "antd";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import FeaturedCreators from "./components/FeaturedCreators";
import HowItWorks from "./components/HowItWorks";

const { Header, Content } = Layout;

export default function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navigation />
      <Content>
        <Home />
        <HowItWorks />
        <FeaturedCreators />
      </Content>
    </Layout>
  );
}
