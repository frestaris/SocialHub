import { useState } from "react";
import { Layout, Drawer, Button, Spin, Typography } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";

import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import MainVideo from "./MainVideo";
import TopCreators from "./TopCreators";
import HotNow from "./HotNow";
import SuggestedForYou from "./SuggestedForYou";

import { useGetAllVideosQuery } from "../../redux/video/videoApi";

const { Sider, Content } = Layout;
const { Title } = Typography;

export default function Explore() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 🔹 Fetch all videos
  const { data, isLoading } = useGetAllVideosQuery({ sort: "popular" });
  const videos = data?.videos || [];
  const featured = videos.length > 0 ? videos[0] : null;
  console.log(videos);
  return (
    <Layout style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Sidebar */}
      <Sider
        width={200}
        breakpoint="sm"
        collapsedWidth="0"
        trigger={null}
        style={{ background: "#fff", borderRight: "1px solid #eee" }}
        onBreakpoint={(broken) => setIsMobile(broken)}
      >
        <Sidebar />
      </Sider>

      {/* Mobile drawer */}
      <Drawer
        title="Categories"
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        stylesBody={{ padding: 0 }}
      >
        <Sidebar />
      </Drawer>

      {/* Main Content */}
      <Layout style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            background: "#fff",
            gap: "12px",
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined style={{ fontSize: "18px" }} />}
              onClick={() => setMobileOpen(true)}
              style={{ padding: "0 12px", height: "40px" }}
            />
          )}
          <SearchBar />
        </div>

        <Content style={{ background: "#fff", padding: "16px" }}>
          {isLoading && <Spin />}
          {featured && (
            <>
              <Title level={3}>Featured Video</Title>
              <MainVideo video={featured} />
            </>
          )}
          <TopCreators />
          <HotNow />
          <SuggestedForYou />
        </Content>
      </Layout>
    </Layout>
  );
}
