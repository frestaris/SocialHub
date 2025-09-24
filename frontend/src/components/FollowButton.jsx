import { Button } from "antd";
import { useToggleFollowUserMutation } from "../redux/user/userApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  handleError,
  handleWarning,
  clearNotifications,
} from "../utils/handleMessage";

export default function FollowButton({ userId, isFollowing, size = "middle" }) {
  const currentUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [toggleFollowUser] = useToggleFollowUserMutation();
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async (e) => {
    e.stopPropagation();

    if (!currentUser) {
      handleWarning(
        "Login Required",
        "You need to log in to follow users.",
        <Button
          type="primary"
          size="small"
          onClick={() => {
            clearNotifications();
            navigate("/login", { state: { from: `/profile/${userId}` } });
          }}
        >
          Go to Login
        </Button>
      );
      return;
    }

    setLoading(true);
    try {
      await toggleFollowUser(userId).unwrap();
    } catch (err) {
      handleError(err, "Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size={size}
      loading={loading}
      onClick={handleFollowToggle}
      style={{
        padding: size === "small" ? "6px 14px" : "6px 16px",
        fontSize: size === "small" ? "13px" : "14px",
        borderRadius: "20px",
        border: "none",
        background: isFollowing
          ? "#f0f0f0"
          : "linear-gradient(90deg, #00c6ff, #0072ff)",
        color: isFollowing ? "#333" : "#fff",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        boxShadow: !isFollowing ? "0 0 12px rgba(0, 198, 255, 0.7)" : "none",
      }}
      onMouseEnter={(e) => {
        if (isFollowing) {
          e.currentTarget.style.background = "#e0e0e0";
        } else {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 0 12px rgba(0, 198, 255, 0.7)";
        }
      }}
      onMouseLeave={(e) => {
        if (isFollowing) {
          e.currentTarget.style.background = "#f0f0f0";
        } else {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 12px rgba(0, 198, 255, 0.7)";
        }
      }}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
