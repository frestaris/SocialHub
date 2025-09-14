import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/users`,
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
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      query: () => `/me`,
    }),
    getUserById: builder.query({
      query: (id) => `/${id}`,
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: "/me",
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: updated } = await queryFulfilled;

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

          // Update getUserById cache if it exists
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
    deleteUser: builder.mutation({
      query: () => ({
        url: "/me",
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
