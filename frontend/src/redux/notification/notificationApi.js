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

// =============================================================
// notificationApi
// -------------------------------------------------------------
// Handles fetching, marking, and local caching of notifications.
// Syncs with Firebase-authenticated backend via authorizedBaseQuery.
// =============================================================

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseQueryWithAuthCheck,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    // ---- GET NOTIFICATIONS (paginated) ----
    getNotifications: builder.query({
      query: ({ skip = 0, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        params.append("limit", limit);
        params.append("skip", skip);
        return `/?${params.toString()}`;
      },
      transformResponse: (res) => ({
        notifications: res.notifications,
        hasMore: res.hasMore,
        total: res.total,
      }),
      providesTags: ["Notification"],
    }),

    // ---- MARK ALL AS READ ----
    markAsRead: builder.mutation({
      query: () => ({ url: "/read", method: "PATCH" }),
      invalidatesTags: ["Notification"],
    }),

    // ---- ADD LOCAL NOTIFICATION (client-side insert for real-time) ----
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

    // ---- CLEAR NOTIFICATIONS (client-side reset) ----
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
  useLazyGetNotificationsQuery,
} = notificationApi;
