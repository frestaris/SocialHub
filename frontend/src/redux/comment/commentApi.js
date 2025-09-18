import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";

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
  }),
});

export const { useGetCommentsByPostQuery, useCreateCommentMutation } =
  commentApi;
