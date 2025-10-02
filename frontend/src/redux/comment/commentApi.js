import { createApi } from "@reduxjs/toolkit/query/react";

import { postApi } from "../post/postApi";
import authorizedBaseQuery from "../utils/authorizedBaseQuery";

function updateFeedCaches(postApi, dispatch, queries, postId, updater) {
  Object.entries(queries).forEach(([cacheKey, entry]) => {
    if (
      (cacheKey.startsWith("getPosts") || cacheKey.startsWith("getUserFeed")) &&
      entry.originalArgs
    ) {
      dispatch(
        postApi.util.updateQueryData(
          cacheKey.split("(")[0],
          entry.originalArgs,
          (draft) => {
            const collection = draft.posts || draft.feed;
            if (!collection) {
              return;
            }

            const idx = collection.findIndex((p) => p._id === postId);
            if (idx !== -1) {
              updater(collection[idx]);
            }
          }
        )
      );
    }
  });
}

// Comment API slice (RTK Query)
// Handles fetching, creating, updating, and deleting comments
export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: authorizedBaseQuery("/comments"),
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    // ---- GET COMMENTS ----
    getCommentsByPost: builder.query({
      query: (postId) => `/post/${postId}`,
      providesTags: (result, error, postId) => [
        { type: "Comment", id: postId },
      ],
    }),

    // ---- CREATE COMMENT ----
    createComment: builder.mutation({
      query: (commentData) => ({
        url: "/",
        method: "POST",
        body: commentData,
      }),
      async onQueryStarted({ postId }, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          // 1) Update the comments list cache with the full new comment
          dispatch(
            commentApi.util.updateQueryData(
              "getCommentsByPost",
              postId,
              (draft) => {
                draft.comments.unshift(data.comment);
              }
            )
          );

          // 2) Replace the single post cache with the fully populated post
          dispatch(
            postApi.util.updateQueryData("getPostById", postId, (draft) => {
              draft.post = data.post;
            })
          );

          // 3) Replace the post inside any feed/getPosts caches
          const queries = getState().postApi.queries;
          Object.entries(queries).forEach(([cacheKey, entry]) => {
            if (
              (cacheKey.startsWith("getPosts") ||
                cacheKey.startsWith("getUserFeed") ||
                cacheKey.startsWith("getPostsByUser")) &&
              entry.originalArgs
            ) {
              dispatch(
                postApi.util.updateQueryData(
                  cacheKey.split("(")[0],
                  entry.originalArgs,
                  (draft) => {
                    const collection = draft.posts || draft.feed;
                    if (!collection) return;
                    const idx = collection.findIndex((p) => p._id === postId);
                    if (idx !== -1) collection[idx] = data.post;
                  }
                )
              );
            }
          });
        } catch (err) {
          console.error("Create comment cache update failed:", err);
        }
      },
    }),

    // ---- UPDATE COMMENT ----
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
            // Update cached comment content
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

    // ---- DELETE COMMENT ----
    deleteComment: builder.mutation({
      query: ({ id }) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { id, postId },
        { dispatch, queryFulfilled, getState }
      ) {
        try {
          await queryFulfilled;
          const state = getState();
          const queries = state.postApi.queries;

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

            // Update single post cache
            dispatch(
              postApi.util.updateQueryData("getPostById", postId, (draft) => {
                draft.post.comments = draft.post.comments.filter(
                  (c) => c !== id
                );
              })
            );

            // Update all cached getPosts + getUserFeed queries
            updateFeedCaches(postApi, dispatch, queries, postId, (post) => {
              post.comments = post.comments.filter((c) => c !== id);
            });
          }
        } catch (err) {
          console.error("Delete comment cache update failed:", err);
        }
      },
    }),

    //  ---- TOGGLE LIKE COMMENT ----
    toggleLikeComment: builder.mutation({
      query: ({ id }) => ({
        url: `/${id}/like`,
        method: "PATCH",
      }),
      async onQueryStarted({ id, postId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            commentApi.util.updateQueryData(
              "getCommentsByPost",
              postId,
              (draft) => {
                const idx = draft.comments.findIndex((c) => c._id === id);
                if (idx !== -1) draft.comments[idx] = data.comment;
              }
            )
          );
        } catch (err) {
          console.error("Like comment cache update failed:", err);
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
  useToggleLikeCommentMutation,
} = commentApi;
