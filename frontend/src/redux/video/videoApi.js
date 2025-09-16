import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";

export const videoApi = createApi({
  reducerPath: "videoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/video`,
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
  tagTypes: ["Video", "UserVideos", "AllVideos"],
  endpoints: (builder) => ({
    // Get all videos (Explore)
    getAllVideos: builder.query({
      query: ({ category, sort }) => {
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (sort) params.append("sort", sort);
        return `?${params.toString()}`;
      },
      providesTags: ["AllVideos"],
    }),

    // Get videos by user
    getVideosByUser: builder.query({
      query: ({ userId, sort }) => `/user/${userId}?sort=${sort}`,
      providesTags: (result, error, { userId }) => [
        { type: "UserVideos", id: userId },
      ],
    }),

    // Get video by ID
    getVideoById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Video", id }],
    }),

    // Create video
    createVideo: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllVideos", "UserVideos"],
    }),

    // Update video
    updateVideo: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Video", id },
        "AllVideos",
        "UserVideos",
        "Post",
      ],
    }),

    // Delete video
    deleteVideo: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllVideos", "UserVideos", "Post"],
    }),
  }),
});

export const {
  useGetAllVideosQuery,
  useGetVideosByUserQuery,
  useGetVideoByIdQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
} = videoApi;
