import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "../../utils/baseURL";
import { auth } from "../../firebase";

export default function authorizedBaseQuery(path) {
  return fetchBaseQuery({
    baseUrl: `${baseURL}${path}`,
    credentials: "include",
    prepareHeaders: async (headers) => {
      const user = auth.currentUser;
      if (user) {
        const freshToken = await user.getIdToken();
        headers.set("Authorization", `Bearer ${freshToken}`);
      }
      return headers;
    },
  });
}
