// --- Libraries ---
import { Typography, Avatar, Button, Grid, Spin, Result } from "antd";
import { UserOutlined } from "@ant-design/icons";

// --- Routing ---
import { Link } from "react-router-dom";

// --- Redux ---
import { useSelector } from "react-redux";
import { useListUsersQuery } from "../../redux/user/userApi";

// --- Components ---
import FollowButton from "../../components/common/FollowButton";
import ReusableCarousel from "../../components/common/ReusableCarousel";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function TopCreators() {
  // --- API query ---
  const { data, isLoading, isError } = useListUsersQuery();
  const users = data?.users || [];

  // --- Redux state ---
  const currentUser = useSelector((state) => state.auth.user);

  // --- Responsive breakpoints ---
  const screens = useBreakpoint();
  const avatarSize = screens.md ? 100 : 70;
  const fontSize = screens.md ? "16px" : "14px";
  const coverHeight = 120;

  // --- Loading / Error states ---
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to load creators"
        subTitle="Something went wrong while fetching creators. Please try again later."
      />
    );
  }

  return (
    <div style={{ margin: "20px 0" }}>
      <Title level={3}>Top Creators</Title>

      <ReusableCarousel>
        {users.map((user) => {
          const isOwner = currentUser && currentUser._id === user._id;
          const isFollowingUser = currentUser?.following?.some(
            (f) => f._id === user._id
          );

          return (
            <div key={user._id} style={{ padding: "8px 16px 8px 4px" }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  overflow: "hidden",
                  textAlign: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {/* Wrap cover + avatar + username in Link */}
                <Link
                  to={`/profile/${user._id}`}
                  style={{
                    textDecoration: "none",
                    display: "block",
                    width: "100%",
                  }}
                >
                  {/* Cover image or fallback gradient */}
                  <div
                    style={{
                      width: "100%",
                      height: coverHeight,
                      background:
                        user.cover && user.cover.trim() !== ""
                          ? `url(${user.cover}) center/cover no-repeat`
                          : "linear-gradient(135deg, #0F172A, #1E3A8A, #22D3EE)",
                      position: "relative",
                    }}
                  >
                    {/* Avatar overlay */}
                    <Avatar
                      size={avatarSize}
                      src={
                        user.avatar && user.avatar.trim() !== ""
                          ? user.avatar
                          : null
                      }
                      icon={
                        !user.avatar || user.avatar.trim() === "" ? (
                          <UserOutlined />
                        ) : null
                      }
                      style={{
                        position: "absolute",
                        bottom: -avatarSize / 2,
                        left: "50%",
                        transform: "translateX(-50%)",
                        border: "3px solid #fff",
                        background: "#cecece",
                      }}
                    />
                  </div>

                  {/* Username */}
                  <h3
                    style={{
                      margin: "0 4px 12px",
                      color: "#333",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "160px",
                      marginInline: "auto",
                      fontSize,
                      marginTop: avatarSize / 2 + 12,
                    }}
                    title={user.username}
                  >
                    {user.username}
                  </h3>
                </Link>

                {/* Follow/Unfollow button (outside Link) */}
                {!isOwner ? (
                  <FollowButton
                    userId={user._id}
                    isFollowing={isFollowingUser}
                  />
                ) : (
                  <Button disabled style={{ borderRadius: "20px" }}>
                    You
                  </Button>
                )}

                {/* Followers count */}
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#555",
                  }}
                >
                  {user.followers?.length || 0} followers
                </p>
              </div>
            </div>
          );
        })}
      </ReusableCarousel>
    </div>
  );
}
