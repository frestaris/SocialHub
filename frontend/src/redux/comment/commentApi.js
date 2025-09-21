import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";
import { postApi } from "../post/postApi";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/comments`,
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
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    // Get comments for a post
    getCommentsByPost: builder.query({
      query: (postId) => `/post/${postId}`,
      providesTags: (result, error, postId) => [
        { type: "Comment", id: postId },
      ],
    }),

    // Create a new comment
    createComment: builder.mutation({
      query: (commentData) => ({
        url: "/",
        method: "POST",
        body: commentData,
      }),
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (postId) {
            // Update getCommentsByPost cache
            dispatch(
              commentApi.util.updateQueryData(
                "getCommentsByPost",
                postId,
                (draft) => {
                  draft.comments.unshift(data.comment);
                }
              )
            );

            // Update getPostById cache
            dispatch(
              postApi.util.updateQueryData("getPostById", postId, (draft) => {
                if (!draft.post.comments) draft.post.comments = [];
                draft.post.comments.push(data.comment._id);
              })
            );

            // Update getPosts cache
            dispatch(
              postApi.util.updateQueryData("getPosts", undefined, (draft) => {
                const idx = draft.posts?.findIndex((p) => p._id === postId);
                if (idx !== -1) {
                  if (!draft.posts[idx].comments)
                    draft.posts[idx].comments = [];
                  draft.posts[idx].comments.push(data.comment._id);
                }
              })
            );
          }
        } catch (err) {
          console.error("Create comment cache update failed:", err);
        }
      },
    }),

    // Update comment
    updateComment: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      async onQueryStarted({ id, postId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (postId) {
            dispatch(
              commentApi.util.updateQueryData(
                "getCommentsByPost",
                postId,
                (draft) => {
                  const idx = draft.comments?.findIndex((c) => c._id === id);
                  if (idx !== -1) draft.comments[idx] = data.comment;
                }
              )
            );
          }
        } catch (err) {
          console.error("Comment cache update failed:", err);
        }
      },
      invalidatesTags: (result, error, { postId }) =>
        postId ? [{ type: "Comment", id: postId }] : ["Comment"],
    }),

    // Delete comment
    deleteComment: builder.mutation({
      query: ({ id }) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ id, postId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          if (postId) {
            // Remove from cached comments list
            dispatch(
              commentApi.util.updateQueryData(
                "getCommentsByPost",
                postId,
                (draft) => {
                  draft.comments = draft.comments.filter((c) => c._id !== id);
                }
              )
            );

            // Update Post cache
            dispatch(
              postApi.util.updateQueryData("getPostById", postId, (draft) => {
                draft.post.comments = draft.post.comments.filter(
                  (c) => c._id !== id
                );
              })
            );
          }
        } catch (err) {
          console.error("Delete comment cache update failed:", err);
        }
      },
    }),
  }),
});

export const {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
