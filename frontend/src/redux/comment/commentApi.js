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
      invalidatesTags: (result, error, { postId, videoId }) => {
        if (postId) return [{ type: "Comment", id: postId }];
        if (videoId) return [{ type: "Comment", id: videoId }];
        return ["Comment"];
      },
    }),
    //  Update comment
    updateComment: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      async onQueryStarted({ id, postId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          //  Update getCommentsByPost cache instantly
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
      invalidatesTags: (result, error, { postId, videoId }) => {
        if (postId) return [{ type: "Comment", id: postId }];
        if (videoId) return [{ type: "Comment", id: videoId }];
        return ["Comment"];
      },
    }),
    //  Delete comment
    deleteComment: builder.mutation({
      query: ({ id }) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted({ id, postId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // Remove from cached comments list
          if (postId) {
            dispatch(
              commentApi.util.updateQueryData(
                "getCommentsByPost",
                postId,
                (draft) => {
                  draft.comments = draft.comments.filter((c) => c._id !== id);
                }
              )
            );

            // Also update Post cache (so comment length updates in PostInfo)
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
