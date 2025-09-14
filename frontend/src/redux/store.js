import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import { authApi } from "./auth/authApi";
import { userApi } from "./user/userApi";
import { videoApi } from "./video/videoApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [videoApi.reducerPath]: videoApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      videoApi.middleware
    ),
});
