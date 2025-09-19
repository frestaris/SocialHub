import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";
import { setUser } from "../auth/authSlice";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/users`,
    prepareHeaders: async (headers) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(true);
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      query: () => `/me`,
    }),
    getUserById: builder.query({
      query: (id) => `/${id}`,
    }),
    listUsers: builder.query({
      query: () => `/`,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: "/me",
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: updated } = await queryFulfilled;

          dispatch(setUser(updated.user));

          // ✅ Update getCurrentUser cache
          dispatch(
            userApi.util.updateQueryData(
              "getCurrentUser",
              undefined,
              (draft) => {
                draft.user = updated.user;
              }
            )
          );

          // ✅ Update getUserById cache too
          dispatch(
            userApi.util.updateQueryData(
              "getUserById",
              updated.user._id,
              (draft) => {
                draft.user = updated.user;
              }
            )
          );
        } catch (err) {
          console.error("Cache update failed:", err);
        }
      },
    }),
    deleteUser: builder.mutation({
      query: () => ({
        url: "/me",
        method: "DELETE",
      }),
    }),
    toggleFollowUser: builder.mutation({
      query: (userId) => ({
        url: `/${userId}/follow`,
        method: "PATCH",
      }),
      async onQueryStarted(userId, { dispatch, getState, queryFulfilled }) {
        const currentUserId = getState().auth.user?._id;

        // ---- Optimistic update target user ----
        const patchResult = dispatch(
          userApi.util.updateQueryData("getUserById", userId, (draft) => {
            if (!draft.user) return;
            const isFollowing = draft.user.followers.some(
              (f) => f._id?.toString() === currentUserId
            );
            if (isFollowing) {
              draft.user.followers = draft.user.followers.filter(
                (f) => f._id?.toString() !== currentUserId
              );
            } else {
              draft.user.followers.push({ _id: currentUserId });
            }
          })
        );

        try {
          const { data } = await queryFulfilled;

          // ✅ update auth.user (so PostInfo sees the new following state)
          if (data.currentUser) {
            dispatch(setUser(data.currentUser));
          }

          // ✅ optionally patch target user with server’s truth
          if (data.targetUser) {
            dispatch(
              userApi.util.updateQueryData("getUserById", userId, (draft) => {
                draft.user = data.targetUser;
              })
            );
          }
        } catch (err) {
          patchResult.undo(); // rollback optimistic change
          console.error("❌ Toggle follow failed, rolled back:", err);
        }
      },
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useListUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleFollowUserMutation,
} = userApi;
