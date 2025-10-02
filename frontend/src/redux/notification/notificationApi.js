import { createApi } from "@reduxjs/toolkit/query/react";
import authorizedBaseQuery from "../utils/authorizedBaseQuery";
import { auth } from "../../firebase";

const baseQueryWithAuthCheck = async (args, api, extraOptions) => {
  // wait until Firebase has a user before sending any request
  if (!auth.currentUser) {
    return { error: { status: 401, data: "No Firebase user yet" } };
  }
  return authorizedBaseQuery("/notifications")(args, api, extraOptions);
};

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithAuthCheck,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => "/",
      providesTags: ["Notification"],
    }),
    markAsRead: builder.mutation({
      query: () => ({ url: "/read", method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),
    addNotificationLocally: builder.mutation({
      queryFn: (notif, { dispatch }) => {
        dispatch(
          notificationApi.util.updateQueryData(
            "getNotifications",
            undefined,
            (draft) => {
              if (!draft.notifications)
                draft.notifications = [
                  { ...notif, isRead: notif.isRead ?? false },
                  ...(draft.notifications || []),
                ];

              draft.notifications.unshift({
                ...notif,
                isRead: notif.isRead ?? false,
              });
            }
          )
        );
        return { data: notif };
      },
    }),
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
