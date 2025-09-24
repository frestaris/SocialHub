import { Typography, Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import ReusableCarousel from "../../components/ReusableCarousel";
import FollowButton from "../../components/FollowButton";
import { useListUsersQuery } from "../../redux/user/userApi";

const { Title } = Typography;

export default function SuggestedCreators() {
  const { data, isLoading, isError } = useListUsersQuery();
  const users = data?.users || [];
  const currentUser = useSelector((state) => state.auth.user);

  if (isLoading) return <p>Loading suggested creators...</p>;
  if (isError) return <p>Failed to load creators.</p>;

  // 🔹 Example filter: exclude the current user + already followed ones
  const suggested = users.filter(
    (u) =>
      u._id !== currentUser?._id &&
      !currentUser?.following?.some((f) => f._id === u._id)
  );

  return (
    <div style={{ margin: "20px 0" }}>
      <Title level={3}>Suggested Creators</Title>

      <ReusableCarousel>
        {suggested.map((user) => (
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
                {/* Cover */}
                <div
                  style={{
                    width: "100%",
                    height: 80,
                    background:
                      user.cover && user.cover.trim() !== ""
                        ? `url(${user.cover}) center/cover no-repeat`
                        : "linear-gradient(135deg, #1677ff, #52c41a)",
                    position: "relative",
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    size={70}
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
                      bottom: -35,
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
                    fontSize: "14px",
                    marginTop: 35 + 12, // push below avatar
                  }}
                  title={user.username}
                >
                  {user.username}
                </h3>
              </Link>

              {/* Follow button */}
              <FollowButton userId={user._id} isFollowing={false} />

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
        ))}
      </ReusableCarousel>
    </div>
  );
}
