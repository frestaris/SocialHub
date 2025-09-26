import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";
import { setUser } from "../auth/authSlice";

// User API slice (RTK Query)
// Handles profile fetching, updates, following/unfollowing, and deletion

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/users`,
    prepareHeaders: async (headers) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(true); // force refresh token
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),

  endpoints: (builder) => ({
    // ---- GET CURRENT LOGGED-IN USER ----
    getCurrentUser: builder.query({
      query: () => `/me`,
    }),

    // ---- GET USER BY ID ----
    getUserById: builder.query({
      query: (id) => `/${id}`,
    }),

    // ---- LIST USERS ----
    listUsers: builder.query({
      query: () => `/`,
    }),

    // ---- UPDATE USER PROFILE ----
    updateUser: builder.mutation({
      query: (data) => ({
        url: "/me",
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: updated } = await queryFulfilled;

          // Update Redux auth slice
          dispatch(setUser(updated.user));

          // Update getCurrentUser cache
          dispatch(
            userApi.util.updateQueryData(
              "getCurrentUser",
              undefined,
              (draft) => {
                draft.user = updated.user;
              }
            )
          );

          // Update getUserById cache
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

    // ---- DELETE USER ----
    deleteUser: builder.mutation({
      query: () => ({
        url: "/me",
        method: "DELETE",
      }),
    }),

    // ---- FOLLOW / UNFOLLOW USER ----
    toggleFollowUser: builder.mutation({
      query: (userId) => ({
        url: `/${userId}/follow`,
        method: "PATCH",
      }),
      async onQueryStarted(userId, { dispatch, getState, queryFulfilled }) {
        const currentUserId = getState().auth.user?._id;

        // ---- Optimistic update target user (getUserById) ----
        const patchGetUserById = dispatch(
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

        // ---- Optimistic update listUsers ----
        const patchListUsers = dispatch(
          userApi.util.updateQueryData("listUsers", undefined, (draft) => {
            if (!draft?.users) return;
            const target = draft.users.find((u) => u._id === userId);
            if (!target) return;

            const isFollowing = target.followers.some(
              (f) => f._id?.toString() === currentUserId
            );
            if (isFollowing) {
              target.followers = target.followers.filter(
                (f) => f._id?.toString() !== currentUserId
              );
            } else {
              target.followers.push({ _id: currentUserId });
            }
          })
        );

        try {
          const { data } = await queryFulfilled;

          // Update auth.user (so following state is reflected in Redux)
          if (data.currentUser) {
            dispatch(setUser(data.currentUser));
          }

          // Replace with server-truth targetUser if returned
          if (data.targetUser) {
            dispatch(
              userApi.util.updateQueryData("getUserById", userId, (draft) => {
                draft.user = data.targetUser;
              })
            );

            dispatch(
              userApi.util.updateQueryData("listUsers", undefined, (draft) => {
                const idx = draft.users?.findIndex((u) => u._id === userId);
                if (idx !== -1) {
                  draft.users[idx] = data.targetUser;
                }
              })
            );
          }
        } catch (err) {
          // Roll back optimistic updates on error
          patchGetUserById.undo();
          patchListUsers.undo();
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
