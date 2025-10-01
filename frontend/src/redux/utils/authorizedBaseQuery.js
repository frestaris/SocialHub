import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";

// Factory to create a baseQuery with auth header handling
export default function authorizedBaseQuery(path) {
  return fetchBaseQuery({
    baseUrl: `${baseURL}${path}`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;

      headers.set("Content-Type", "application/json");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  });
}
