import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";

export const postApi = createApi({
  reducerPath: "postApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/posts`,
    prepareHeaders: async (headers) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Post", "Feed"],
  endpoints: (builder) => ({
    // ---- CREATE ----
    createPost: builder.mutation({
      query: (newPost) => ({
        url: `/`,
        method: "POST",
        body: newPost,
      }),
      invalidatesTags: ["Post", "Feed"],
    }),

    // ---- GET ALL POSTS ----
    getPosts: builder.query({
      query: () => "",
      providesTags: ["Post"],
    }),

    // ---- GET POSTS BY USER ----
    getPostsByUser: builder.query({
      query: ({ userId, sort }) => `/user/${userId}?sort=${sort}`,
      providesTags: (result, error, { userId }) => [
        { type: "Post", id: userId },
      ],
    }),

    // ---- GET USER FEED ----
    getUserFeed: builder.query({
      query: ({ userId, sort }) => `/feed/${userId}?sort=${sort || "newest"}`,
      providesTags: ["Feed"],
    }),

    // ---- UPDATE POST ----
    updatePost: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // Update cache for getPosts
          dispatch(
            postApi.util.updateQueryData("getPosts", undefined, (draft) => {
              const idx = draft.posts?.findIndex((p) => p._id === id);
              if (idx !== -1) draft.posts[idx] = data.post;
            })
          );

          // Update cache for getPostsByUser
          dispatch(
            postApi.util.updateQueryData(
              "getPostsByUser",
              { userId: data.post.userId._id, sort: "newest" },
              (draft) => {
                const idx = draft.posts?.findIndex((p) => p._id === id);
                if (idx !== -1) draft.posts[idx] = data.post;
              }
            )
          );

          // Update cache for getUserFeed
          dispatch(
            postApi.util.updateQueryData(
              "getUserFeed",
              { userId: data.post.userId._id, sort: "newest" },
              (draft) => {
                const idx = draft.feed?.findIndex((f) => f._id === id);
                if (idx !== -1) draft.feed[idx] = data.post;
              }
            )
          );
        } catch (err) {
          console.error("Cache update failed:", err);
        }
      },
      invalidatesTags: ["Post", "Feed"],
    }),

    // ---- DELETE POST ----
    deletePost: builder.mutation({
      query: ({ id }) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ id, userId, sort }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // Remove from getPosts cache
          dispatch(
            postApi.util.updateQueryData("getPosts", undefined, (draft) => {
              draft.posts = draft.posts?.filter((p) => p._id !== id);
            })
          );

          // Remove from getPostsByUser cache
          dispatch(
            postApi.util.updateQueryData(
              "getPostsByUser",
              { userId, sort: sort || "newest" },
              (draft) => {
                draft.posts = draft.posts?.filter((p) => p._id !== id);
              }
            )
          );

          // Remove from getUserFeed cache
          dispatch(
            postApi.util.updateQueryData(
              "getUserFeed",
              { userId, sort: sort || "newest" },
              (draft) => {
                draft.feed = draft.feed?.filter((f) => f._id !== id);
              }
            )
          );
        } catch (err) {
          console.error("Cache update after delete failed:", err);
        }
      },
      invalidatesTags: ["Post", "Feed"],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useGetPostsByUserQuery,
  useGetUserFeedQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postApi;
