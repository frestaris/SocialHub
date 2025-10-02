import { createApi } from "@reduxjs/toolkit/query/react";
import authorizedBaseQuery from "../utils/authorizedBaseQuery";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: authorizedBaseQuery("/notifications"),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    // ---- Fetch all notifications for logged-in user ----
    getNotifications: builder.query({
      query: () => "/",
      providesTags: ["Notification"],
    }),

    // ---- Mark all as read ----
    markAsRead: builder.mutation({
      query: () => ({
        url: "/read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    // ---- Add a notification (for socket updates) ----
    addNotificationLocally: builder.mutation({
      queryFn: (notif, { dispatch }) => {
        // patch existing cache manually
        dispatch(
          notificationApi.util.updateQueryData(
            "getNotifications",
            undefined,
            (draft) => {
              if (!draft.notifications) draft.notifications = [];
              draft.notifications.unshift(notif);
            }
          )
        );
        return { data: notif };
      },
    }),

    // ---- Clear all notifications from cache (optional) ----
    clearNotifications: builder.mutation({
      queryFn: (_, { dispatch }) => {
        dispatch(
          notificationApi.util.updateQueryData(
            "getNotifications",
            undefined,
            (draft) => {
              draft.notifications = [];
            }
          )
        );
        return { data: [] };
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useAddNotificationLocallyMutation,
  useClearNotificationsMutation,
} = notificationApi;
