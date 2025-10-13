import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";

// =============================================================
// authorizedBaseQuery(path)
// -------------------------------------------------------------
// Wraps RTK Query's fetchBaseQuery with Firebase auth support.
// Automatically attaches a fresh Firebase ID token to requests.
// Used by all authorized API slices (posts, comments, notifications).
// =============================================================

export default function authorizedBaseQuery(path) {
  return fetchBaseQuery({
    baseUrl: `${baseURL}${path}`,
    credentials: "include",
    prepareHeaders: async (headers) => {
      // Always fetch a *fresh* Firebase ID token to avoid expiry issues

      const user = auth.currentUser;
      if (user) {
        const freshToken = await user.getIdToken();
        headers.set("Authorization", `Bearer ${freshToken}`);
      }
      return headers;
    },
  });
}
