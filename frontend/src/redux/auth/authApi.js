import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { setCredentials } from "./authSlice";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseURL}/auth`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      headers.set("Content-Type", "application/json");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (builder) => ({
    firebaseLogin: builder.mutation({
      query: ({ token, username, role }) => ({
        url: "/firebase-login",
        method: "POST",
        body: { token, username, role },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Save user + token to Redux + localStorage
          dispatch(setCredentials({ user: data.user, token: arg }));
        } catch (err) {
          console.error("Login failed:", err);
        }
      },
    }),
  }),
});

export const { useFirebaseLoginMutation } = authApi;
