import { Typography, Avatar, Button, Grid } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Link } from "react-router-dom";
import { useListUsersQuery } from "../../redux/user/userApi";
import { useSelector } from "react-redux";
import FollowButton from "../../components/FollowButton";

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function TopCreators() {
  const { data, isLoading, isError } = useListUsersQuery();
  const users = data?.users || [];
  const currentUser = useSelector((state) => state.auth.user);
  const screens = useBreakpoint();

  if (isLoading) return <p>Loading creators...</p>;
  if (isError) return <p>Failed to load creators.</p>;

  const avatarSize = screens.md ? 100 : 70;
  const fontSize = screens.md ? "16px" : "14px";
  const coverHeight = 80;

  return (
    <div style={{ margin: "20px 0" }}>
      <Title level={3}>Top Creators</Title>

      <Swiper
        spaceBetween={20}
        slidesOffsetBefore={12}
        slidesOffsetAfter={12}
        style={{ paddingBottom: "20px" }}
        breakpoints={{
          1024: { slidesPerView: 4.4 },
          768: { slidesPerView: 2.4 },
          0: { slidesPerView: 1.4 },
        }}
      >
        {users.map((user) => {
          const isOwner = currentUser && currentUser._id === user._id;
          const isFollowingUser =
            currentUser &&
            currentUser.following?.some((f) => f._id === user._id);

          return (
            <SwiperSlide key={user._id} style={{ height: "100%" }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  overflow: "hidden",
                  textAlign: "center",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Cover */}
                <div
                  style={{
                    width: "100%",
                    height: coverHeight,
                    background:
                      user.cover && user.cover.trim() !== ""
                        ? `url(${user.cover}) center/cover no-repeat`
                        : "linear-gradient(135deg, #1677ff, #52c41a)",
                  }}
                />

                {/* Content */}
                <div
                  style={{
                    padding: "20px",
                    marginTop: -(avatarSize - coverHeight / 2),
                    flexGrow: 1,
                  }}
                >
                  <Link
                    to={`/profile/${user._id}`}
                    style={{ textDecoration: "none", display: "block" }}
                    onClick={(e) => e.stopPropagation()}
                  >
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
                        marginBottom: "12px",
                        border: "3px solid #fff",
                        background: "#cecece",
                      }}
                    />

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
                      }}
                      title={user.username}
                    >
                      {user.username}
                    </h3>
                  </Link>

                  {!isOwner ? (
                    <FollowButton
                      userId={user._id}
                      isFollowing={isFollowingUser}
                      isOwner={isOwner}
                      block
                    />
                  ) : (
                    <Button block disabled style={{ borderRadius: "20px" }}>
                      You
                    </Button>
                  )}
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
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
