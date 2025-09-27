import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout, Drawer, Button, Grid } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";

import Sidebar from "./Sidebar";
import Feed from "./Feed";
import SearchBar from "../../components/SearchBar";
import useSearchHandler from "../../hooks/useSearchHandler";
import Footer from "../../components/Footer";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function Explore() {
  const { category } = useParams();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const screens = useBreakpoint();
  const isSmallScreen = !screens.sm;

  const { inputValue, setInputValue, searchQuery, handleSearch } =
    useSearchHandler();

  useEffect(() => {
    if (category) {
      setSelectedCategories([category]);
    } else {
      setSelectedCategories([]);
    }
  }, [category]);

  return (
    <Layout style={{ minHeight: "calc(100vh - 64px)" }}>
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
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
        onBreakpoint={(broken) => setIsMobile(broken)}
      >
        {/* Sidebar card */}
        <div
          style={{
            position: "sticky",
            top: 80,
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <Sidebar
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />
        </div>

        {/* Footer card */}
        <div
          style={{
            position: "sticky",
            top: 80 + 400 + 16,
            marginTop: 16,
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <Footer />
        </div>
      </Sider>

      <Drawer
        title="Categories"
        placement="left"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        styles={{
          body: {
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            padding: 0,
          },
        }}
      >
        {/* Sidebar (scrollable area) */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Sidebar
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            onClose={() => setMobileOpen(false)}
          />
        </div>

        {/* Footer (always at bottom) */}
        <div style={{ borderTop: "1px solid #f0f0f0" }}>
          <Footer />
        </div>
      </Drawer>

      <Layout style={{ flex: 1 }}>
        {/* Header row only on small screens */}
        {isSmallScreen && (
          <div
            style={{
              position: "fixed",
              top: 64,
              width: "100%",
              zIndex: 100,
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

            <div style={{ flex: 1 }}>
              <SearchBar
                value={inputValue}
                onChange={setInputValue}
                onSearch={handleSearch}
              />
            </div>
          </div>
        )}

        <Content
          style={{
            background: "#fafafa",
            padding: "16px",
            paddingTop: isSmallScreen ? 72 : 16,
          }}
        >
          <Feed
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
          />
        </Content>
      </Layout>
    </Layout>
  );
}
