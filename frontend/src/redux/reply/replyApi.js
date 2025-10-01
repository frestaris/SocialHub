import { createApi } from "@reduxjs/toolkit/query/react";
import { commentApi } from "../comment/commentApi";
import authorizedBaseQuery from "../utils/authorizedBaseQuery";

export const replyApi = createApi({
  reducerPath: "replyApi",
  baseQuery: authorizedBaseQuery("/replies"),

  tagTypes: ["Reply"],

  endpoints: (builder) => ({
    // ---- CREATE REPLY ----
    createReply: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body, // { commentId, postId, content }
      }),
      async onQueryStarted(
        { commentId, postId },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            commentApi.util.updateQueryData(
              "getCommentsByPost",
              postId,
              (draft) => {
                const parent = draft.comments.find((c) => c._id === commentId);
                if (parent) {
                  parent.replies = data.replies;
                }
              }
            )
          );
        } catch (err) {
          console.error("Create reply cache update failed:", err);
        }
      },
    }),

    // ---- UPDATE REPLY ----
    updateReply: builder.mutation({
      query: ({ commentId, replyId, ...patch }) => ({
        url: `/${commentId}/${replyId}`,
        method: "PUT",
        body: patch, // { content, postId }
      }),
      async onQueryStarted(
        { commentId, postId },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            commentApi.util.updateQueryData(
              "getCommentsByPost",
              postId,
              (draft) => {
                const parent = draft.comments.find((c) => c._id === commentId);
                if (parent) {
                  parent.replies = data.replies;
                }
              }
            )
          );
        } catch (err) {
          console.error("Update reply cache update failed:", err);
        }
      },
    }),

    // ---- DELETE REPLY ----
    deleteReply: builder.mutation({
      query: ({ commentId, replyId }) => ({
        url: `/${commentId}/${replyId}`,
        method: "DELETE",
      }),
      async onQueryStarted(
        { commentId, replyId, postId },
        { dispatch, queryFulfilled }
      ) {
        try {
          await queryFulfilled;

          dispatch(
            commentApi.util.updateQueryData(
              "getCommentsByPost",
              postId,
              (draft) => {
                const parent = draft.comments.find((c) => c._id === commentId);
                if (parent) {
                  parent.replies = parent.replies.filter(
                    (r) => r._id !== replyId
                  );
                }
              }
            )
          );
        } catch (err) {
          console.error("Delete reply cache update failed:", err);
        }
      },
    }),
  }),
});

export const {
  useCreateReplyMutation,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
} = replyApi;
