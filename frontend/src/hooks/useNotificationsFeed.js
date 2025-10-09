import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkAsReadMutation,
} from "../redux/notification/notificationApi";

export default function useNotificationsFeed({ limit = 10, active = false }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const listRef = useRef(null);

  // Always fetch a small initial query for the badge
  const { data: badgeData } = useGetNotificationsQuery({ skip: 0, limit: 10 });

  // Fetch main list (only when active)
  const { data, isFetching, isLoading } = useGetNotificationsQuery(
    { skip: 0, limit },
    { skip: !active }
  );
  const [fetchMore] = useLazyGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();

  // Initialize notifications when open
  useEffect(() => {
    if (data?.notifications) {
      setNotifications(data.notifications);
      setHasMore(data.hasMore);
      setSkip(0);
    }
  }, [data]);

  // Infinite scroll handler
  const handleScroll = (e) => {
    const el = e.target;
    const { scrollTop, clientHeight, scrollHeight } = el;
    const nearBottom = scrollTop + clientHeight >= scrollHeight * 0.9;

    if (nearBottom && !loadingMore && hasMore) {
      setLoadingMore(true);

      const nextSkip = skip + limit;
      fetchMore({ skip: nextSkip, limit })
        .unwrap()
        .then((more) => {
          if (more?.notifications?.length) {
            setNotifications((prev) => [...prev, ...more.notifications]);
            const totalLoaded = nextSkip + more.notifications.length;
            const totalAvailable = data?.total ?? totalLoaded;
            setHasMore(totalLoaded < totalAvailable);
            setSkip(nextSkip);
          } else {
            setHasMore(false);
          }
        })
        .finally(() => setLoadingMore(false));
    }
  };

  // Navigation handler (same as desktop)
  const handleClick = (n) => {
    if (n.isRead === false) markAsRead();

    if (!n.postId && n.type !== "follow") return;

    switch (n.type) {
      case "new_post":
      case "like_post":
      case "comment":
      case "view_milestone":
        navigate(`/post/${n.postId}`);
        break;
      case "like_comment":
      case "reply":
      case "reply_on_post":
        navigate(`/post/${n.postId}?comment=${n.commentId}`);
        break;
      case "like_reply":
        navigate(`/post/${n.postId}?comment=${n.commentId}&reply=${n.replyId}`);
        break;
      case "follow":
        navigate(`/profile/${n.fromUser._id}`);
        break;
      default:
        break;
    }
  };

  // Compute unread badge
  const unreadCount =
    badgeData?.notifications?.filter((n) => !n.isRead).length || 0;

  // Expose everything
  return {
    notifications,
    unreadCount,
    listRef,
    isLoading,
    isFetching,
    loadingMore,
    hasMore,
    handleScroll,
    handleClick,
    markAsRead,
  };
}
