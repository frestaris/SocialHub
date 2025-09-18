import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";
import { setUser } from "../auth/authSlice";
import { postApi } from "../post/postApi";

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
    followUser: builder.mutation({
      query: (userId) => ({
        url: `/${userId}/follow`,
        method: "POST",
      }),
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.currentUser) {
            dispatch(setUser(data.currentUser)); // update auth.user
          }
          if (data.targetUser) {
            // ✅ Update getUserById cache
            dispatch(
              userApi.util.updateQueryData("getUserById", userId, (draft) => {
                draft.user = data.targetUser;
              })
            );

            // ✅ Update getPostById cache
            dispatch(
              postApi.util.updateQueryData("getPostById", userId, (draft) => {
                if (draft.post?.userId?._id === data.targetUser._id) {
                  draft.post.userId = data.targetUser;
                }
              })
            );
          }
        } catch (err) {
          console.error("Follow mutation failed:", err);
        }
      },
    }),

    unfollowUser: builder.mutation({
      query: (userId) => ({
        url: `/${userId}/unfollow`,
        method: "POST",
      }),
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data.currentUser) {
            dispatch(setUser(data.currentUser));
          }
          if (data.targetUser) {
            // ✅ Update getUserById cache
            dispatch(
              userApi.util.updateQueryData("getUserById", userId, (draft) => {
                draft.user = data.targetUser;
              })
            );

            // ✅ Update getPostById cache
            dispatch(
              postApi.util.updateQueryData("getPostById", userId, (draft) => {
                if (draft.post?.userId?._id === data.targetUser._id) {
                  draft.post.userId = data.targetUser;
                }
              })
            );
          }
        } catch (err) {
          console.error("Unfollow mutation failed:", err);
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
  useFollowUserMutation,
  useUnfollowUserMutation,
} = userApi;
