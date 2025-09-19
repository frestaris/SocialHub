import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import { authApi } from "./auth/authApi";
import { userApi } from "./user/userApi";
import { postApi } from "./post/postApi";
import { commentApi } from "./comment/commentApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      postApi.middleware,
      commentApi.middleware
    ),
});
