import { createApi } from "@reduxjs/toolkit/query/react";
import authorizedBaseQuery from "../utils/authorizedBaseQuery";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: authorizedBaseQuery("/notifications"),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    // Fetch all notifications for logged-in user
    getNotifications: builder.query({
      query: () => "/",
      providesTags: ["Notification"],
    }),

    // Mark all as read
    markAsRead: builder.mutation({
      query: () => ({
        url: "/read",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAsReadMutation } =
  notificationApi;
