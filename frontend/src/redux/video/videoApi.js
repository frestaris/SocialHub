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
  tagTypes: ["Video", "UserVideos", "AllVideos", "Feed"],
  endpoints: (builder) => ({
    // Get video by ID
    getVideoById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Video", id }],
    }),
  }),
});

export const { useGetVideoByIdQuery } = videoApi;
