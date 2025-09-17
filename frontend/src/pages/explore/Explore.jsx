import { useState } from "react";
import { Layout, Drawer, Button } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";

import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import TopCreators from "./TopCreators";
import HotNow from "./HotNow";
import SuggestedForYou from "./SuggestedForYou";
import Feed from "./Feed";

const { Sider, Content } = Layout;

export default function Explore() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  return (
    <Layout style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Sidebar */}
      <Sider
        width={200}
        breakpoint="sm"
        collapsedWidth="0"
        trigger={null}
        style={{
          background: "#fafafa",
          borderRight: "none",
          paddingLeft: isMobile ? 0 : 16,
          paddingTop: isMobile ? 0 : 8,
        }}
        onBreakpoint={(broken) => setIsMobile(broken)}
      >
        <div
          style={{
            position: "sticky",
            top: 20,
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <Sidebar />
        </div>
      </Sider>

      {/* Mobile drawer */}
      <Drawer
        title="Categories"
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
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
            background: "#fafafa",
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

        <Content style={{ background: "#fafafa", padding: "16px" }}>
          <Feed />
          <TopCreators />
          <HotNow />
          <SuggestedForYou />
        </Content>
      </Layout>
    </Layout>
  );
}
