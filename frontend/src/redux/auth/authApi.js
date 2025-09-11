import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000" }),
  endpoints: (builder) => ({
    // Firebase login (Google)
    firebaseLogin: builder.mutation({
      query: (token) => ({
        url: "/auth/firebase-login",
        method: "POST",
        body: { token },
      }),
    }),
    // Email/password register
    register: builder.mutation({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    // Email/password login
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const {
  useFirebaseLoginMutation,
  useRegisterMutation,
  useLoginMutation,
} = authApi;
