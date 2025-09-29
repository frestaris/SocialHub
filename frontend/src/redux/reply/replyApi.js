import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";
import { commentApi } from "../comment/commentApi";

export const replyApi = createApi({
  reducerPath: "replyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/replies`,
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
